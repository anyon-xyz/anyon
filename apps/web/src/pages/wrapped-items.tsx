import { deleteCookie, getCookie } from "cookies-next";
import { NextPage } from "next";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Puff } from "react-loading-icons";
import { Container } from "~/components/Container";
import { useUser } from "~/hooks/useUser";
import { useStore } from "~/store";
import { api } from "~/utils/api";

const WrappedItems: NextPage = () => {
  const { user, setUser, setShowSteamLinkModal } = useStore((state) => ({
    user: state.user,
    setUser: state.setUser,
    setShowSteamLinkModal: state.setShowSteamLinkModal,
    csgoInventory: state.csgoInventory,
    selectItemToWrap: state.selectItemToWrap,
  }));
  const { authenticate } = useUser();

  const { data, isLoading } = api.steam.wrappedItems.useQuery(undefined, {
    retry: false,
  });

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
    <Container>
      <div className="flex flex-col items-center gap-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-[3rem]">
          My wrapped items
        </h1>
      </div>

      {isLoading ? <Puff /> : null}

      {data && data.length > 0 ? (
        <div className="md grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
          {data.map((item) => (
            <div
              key={item.id}
              className={`flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white ${
                item.declined ? "opacity-70" : ""
              }`}
            >
              <h3 className="flex-1 cursor-pointer text-lg font-bold hover:underline">
                {item.marketHashName}
              </h3>

              <div className="flex flex-col items-center justify-center">
                <Image
                  key={item.id}
                  width={150}
                  height={150}
                  src={`https://steamcommunity-a.akamaihd.net/economy/image/${item.steamIconUrl}`}
                  alt="item"
                />
              </div>

              {item.escrowEnds && (
                <span className="w-full text-center rounded p-4 text-yellow-400">
                  In escrow by steam until
                  <br />{" "}
                  {item.escrowEnds.toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}

              {item.declined === true && (
                <span className="w-full text-center rounded p-4 text-red-400">
                  Wrap canceled
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <>No wrapped items found</>
      )}

      {!user && <>sign in to see your wrapped items</>}
    </Container>
  );
};

export default WrappedItems;
