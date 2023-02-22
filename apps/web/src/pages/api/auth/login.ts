import { passport, router } from "@anyon/api";

interface AuthLoginResponse extends Response {
  redirect: (path: string) => Record<string, never>;
}

const path = "/api/auth/login";

export default router
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  .use(path, passport.authenticate("steam", { failureRedirect: "/" }))
  .get(path, (_, res: AuthLoginResponse) => {
    res.redirect("/");
  });
