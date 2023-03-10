import { deleteCookie, getCookie } from "cookies-next";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { TfiReload } from "react-icons/tfi";
import { Puff } from "react-loading-icons";
import { Container } from "~/components/Container";
import { api } from "~/utils/api";
import { Inventory } from "../components/Inventory";
import { LinkSteamModal } from "../components/LinkSteamModal";
import { ProfileModal } from "../components/ProfileModal";
import { Wrap } from "../components/Wrap";
import { useInventory } from "../hooks/useInventory";
import { useUser } from "../hooks/useUser";
import { useStore } from "../store";

const Home: NextPage = () => {
  const {
    user,
    csgoInventory,
    setUser,
    setShowSteamLinkModal,
    selectItemToWrap,
  } = useStore((state) => ({
    user: state.user,
    setUser: state.setUser,
    setShowSteamLinkModal: state.setShowSteamLinkModal,
    csgoInventory: state.csgoInventory,
    selectItemToWrap: state.selectItemToWrap,
  }));
  const { isLoadingInventory, onRefetchInventory, setSearchInventoryItem } =
    useInventory();
  const { authenticate } = useUser();

  const _ = api.user.me.useQuery(
    undefined, // no input
    {
      onSuccess(user) {
        setUser(user);
        if (!user.steamId) {
          setShowSteamLinkModal(true);
        }
      },
      onError(error) {
        // try to sign in again
        if (error.data && error.data.httpStatus === 401) {
          console.log("Signing");
          return authenticate();
        }

        deleteCookie("auth-jwt");
        toast.error(
          "Failed to fetch current user. Refresh the page and try sign in again"
        );
      },
      // on error -> reset auth-jwt cookie
      enabled: !user && !!getCookie("auth-jwt"),
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      <Head>
        <title>Anyon Ap</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <div className="flex items-center gap-5 flex-row flex-col">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-[3rem]">
            Wrap CSGO skins
          </h1>

          <span className="italic text-gray-400">
            soon available for other games
          </span>

          {user && user.steamId && (
            <div className="flex gap-4 items-center mt-2 ml-auto w-full">
              <input
                onChange={(e) => setSearchInventoryItem(e.target.value)}
                className="appearance-none block w-full bg-transparent text-white border border-gray-700 rounded py-3 px-5 leading-tight focus:outline-none focus:border-white"
                type="text"
                placeholder="Search skin"
              />

              <TfiReload
                className="cursor-pointer hover:fill-slate-300"
                onClick={() => onRefetchInventory(true)}
                size={20}
              />
            </div>
          )}
        </div>

        {user && user.steamId && !isLoadingInventory ? <Inventory /> : null}
        {user && isLoadingInventory && (
          <div className="flex items-center justify-center">
            <Puff className="mt-4" />
          </div>
        )}

        {!user && <>sign in to wrap steam skins</>}

        {user && !user.steamId && (
          <Link
            className="mr-1 mb-1 mt-6 flex w-full max-w-xl items-center justify-center gap-6 rounded bg-gray-600 px-6 py-3 text-sm font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:bg-gray-700 hover:shadow-lg focus:outline-none active:bg-gray-700"
            href="/api/auth/login"
          >
            <Image
              src="/steam-logo.webp"
              alt="steam-logo"
              width={30}
              height={30}
            />
            Link your steam account to wrap skins into nfts
          </Link>
        )}

        {user && user.steamId && !csgoInventory && !isLoadingInventory && (
          <div>fail to load csgo inventory</div>
        )}

        {selectItemToWrap && <Wrap item={selectItemToWrap} />}

        <LinkSteamModal />

        <ProfileModal />
      </Container>
    </>
  );
};

export default Home;
