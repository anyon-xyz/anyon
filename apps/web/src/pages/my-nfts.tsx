import { NextPage } from "next";
import Image from "next/image";
import { Puff } from "react-loading-icons";
import { Container } from "~/components/Container";
import { useStore } from "~/store";
import { api } from "~/utils/api";

const MyNfts: NextPage = () => {
  const { user, setOpenUnwrapModal } = useStore((state) => ({
    user: state.user,
    setUser: state.setUser,
    setShowSteamLinkModal: state.setShowSteamLinkModal,
    csgoInventory: state.csgoInventory,
    selectItemToWrap: state.selectItemToWrap,
    setOpenUnwrapModal: state.setOpenUnwrapModal,
  }));

  const { data, isLoading } = api.user.getCsgoSkins.useQuery(undefined, {
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return (
    <Container>
      <div className="flex flex-col items-center gap-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-[3rem]">
          My wrapped items
        </h1>
      </div>

      {isLoading ? <Puff /> : null}

      {data && data.length > 0 && (
        <div className="md grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
          {data
            .filter((nft) => nft.model === "nft")
            .map((item) => (
              <div
                key={String(item.address)}
                className={`flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white`}
              >
                <h3 className="flex-1 cursor-pointer text-lg font-bold hover:underline">
                  {item.name}
                </h3>

                <div className="flex flex-col items-center justify-center">
                  <Image
                    key={String(item.address)}
                    width={150}
                    height={150}
                    src={
                      item.jsonLoaded
                        ? (item.json?.image as string)
                        : "https://pbs.twimg.com/profile_images/1606750479836647425/1qsSFQOn_400x400.jpg"
                    }
                    alt="item"
                  />
                </div>

                <button
                  onClick={() => setOpenUnwrapModal(true)}
                  className="mt-auto rounded-xl bg-slate-400 p-2 transition delay-150 duration-300  hover:-translate-y-1 hover:bg-slate-600 "
                >
                  unwrap
                </button>
                {/* 
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
              )} */}

                {/* {item.declined === true && (
                <span className="w-full text-center rounded p-4 text-red-400">
                  Wrap canceled
                </span>
              )} */}
              </div>
            ))}
        </div>
      )}

      {!isLoading && !user && <>sign in to see your wrapped items</>}
    </Container>
  );
};

export default MyNfts;
