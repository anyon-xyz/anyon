import { useWallet } from "@solana/wallet-adapter-react";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LinkSteamModal } from "../components/LinkSteamModal";
import useStore from "../store";
import dynamic from "next/dynamic";
import { api } from "../utils/api";
import { createAuthToken } from "../utils/createAuthToken";
import { Header } from "../components/Header";
import { useUser } from "../hooks/useUser";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const Home: NextPage = () => {
  const { publicKey, connected, signMessage } = useWallet();
  const { authUser, setAuthUser, showSteamLinkModal, setShowSteamLinkModal } =
    useStore();

  const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const { isLoading, mutate: authenticate } = api.auth.login.useMutation({
    onSuccess(data) {
      setCookie("auth-jwt", data.authorization, {
        maxAge: 1000 * 60 * 60 * 12, // 12h
      });
      setAuthUser(data.user);
    },
    onError(err) {
      console.error(err);
    },
  });
  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: authUser !== undefined && authUser !== null }
  );

  const authHandler = async () => {
    if (publicKey && signMessage) {
      const signature = await createAuthToken({ publicKey, signMessage });
      authenticate({
        signature,
      });
    }
  };

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#000] to-[#0b0c1d] text-white">
        <Header />
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              href="https://create.t3.gg/en/usage/first-steps"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">First Steps →</h3>
              <div className="text-lg">
                Just the basics - Everything you need to know to set up your
                database and authentication.
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              href="https://create.t3.gg/en/introduction"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">Documentation →</h3>
              <div className="text-lg">
                Learn more about Create T3 App, the libraries it uses, and how
                to deploy it.
              </div>
            </Link>
          </div>

          {!connected ? (
            <WalletMultiButtonDynamic />
          ) : !authUser ? (
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            <button onClick={authHandler}>Sign</button>
          ) : (
            <>hi {authUser.pubkey}</>
          )}

          {secretMessage && <span> - {secretMessage}</span>}

          {authUser && authUser.pfp && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={authUser.pfp} alt="steam-pfp" />
          )}

          <LinkSteamModal
            showModal={showSteamLinkModal}
            setShowModal={setShowSteamLinkModal}
          />

          <p className="text-2xl text-white">
            {hello.data ? hello.data.greeting : "Loading tRPC query..."}
          </p>
        </div>
      </main>
    </>
  );
};

export default Home;