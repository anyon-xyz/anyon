// @ts-expect-error bad type definitions
import SteamStrategy from "passport-steam";
import passport from "passport";
import { env } from "../../../env/server.mjs";
import { getBaseUrl } from "../../../../src/utils/api";

export interface UserSteam {
  steamid: string;
  communityvisibilitystate: number;
  profilestate: number;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  avatarhash: string;
  lastlogoff: number;
  personastate: number;
  primaryclanid: string;
  timecreated: number;
  personastateflags: number;
  loccountrycode: string;
  locstatecode: string;
  loccityid: number;
}

export interface UserSteamProfile {
  provider: string;
  _json: UserSteam;
  id: string;
  displayName: string;
  photos: string[];
}
passport.serializeUser((user, done) => {
  return done(null, user as UserSteamProfile);
});
passport.deserializeUser((user: UserSteamProfile, done) => {
  return done(null, user);
});

passport.use(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
  new SteamStrategy(
    {
      returnURL: `${getBaseUrl()}/api/auth/callback`,
      realm: `${getBaseUrl()}`,
      apiKey: `${env.STEAM_API_KEY}`,
    },
    (
      _: string,
      user: UserSteamProfile,
      done: (_: null, user: UserSteamProfile) => void
    ) => {
      return done(null, user);
    }
  )
);

export { passport };
