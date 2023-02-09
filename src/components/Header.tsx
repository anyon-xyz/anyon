import Image from "next/image";
import dynamic from "next/dynamic";
import useStore from "../store";
import { useWallet } from "@solana/wallet-adapter-react";
import { shortenAddress } from "../utils/shortenAddress";
import { useUser } from "../hooks/useUser";
import Link from "next/link";
import { useRouter } from "next/router";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export const Header = () => {
  const user = useStore((state) => state.authUser);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { connected } = useWallet();
  const { logout, authenticate } = useUser();
  const router = useRouter();
  const currentRoute = router.pathname;

  return (
    <header className="flex w-full items-center justify-between border-b border-gray-200 px-4 py-4 md:px-16">
      <div className="flex items-center gap-3 md:gap-8">
        <Image
          className="rounded-full"
          src="/full-logo.png"
          alt="logo"
          width={60}
          height={60}
        />
        <Link
          href={"/"}
          className={`text-sm font-medium hover:underline sm:text-base ${
            currentRoute === "/" ? "text-white" : "text-gray-500"
          }`}
        >
          Home
        </Link>
        <a className="cursor-not-allowed text-sm font-medium text-gray-500 sm:text-base">
          Nfts Wrapped
        </a>
        <a className="cursor-not-allowed text-sm font-medium text-gray-500 sm:text-base">
          Inventory
        </a>
      </div>

      {!connected ? (
        <WalletMultiButtonDynamic className="border border-solid" />
      ) : !user ? (
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        <button className="font-bold italic" onClick={authenticate}>
          Sign
        </button>
      ) : (
        <div className="flex items-center">
          <div className="flex flex-col ">
            <span className="hidden font-medium sm:inline-flex">
              {shortenAddress(user.pubkey)}
            </span>
            <span
              onClick={logout}
              className="ml-auto cursor-pointer text-base font-bold text-red-300 hover:underline sm:text-sm sm:font-extralight sm:italic"
            >
              logout
            </span>
          </div>

          {user && user.pfp && (
            <Image
              className="ml-3 rounded-full"
              src={user.pfp}
              width={40}
              height={40}
              alt="steam-pfp"
            />
          )}
        </div>
      )}
    </header>
  );
};
