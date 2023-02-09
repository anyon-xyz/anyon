import Image from "next/image";
import dynamic from "next/dynamic";
import useStore from "../store";
import { useWallet } from "@solana/wallet-adapter-react";
import { shortenAddress } from "../utils/shortenAddress";
import { useUser } from "../hooks/useUser";

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

  return (
    <header className="flex w-full items-center justify-between border-b border-gray-200 px-16 py-4">
      <div className="flex items-center gap-6">
        <Image
          className="rounded-full"
          src="/full-logo.png"
          alt="logo"
          width={60}
          height={60}
        />
        <a>No name yet</a>
      </div>

      {!connected ? (
        <WalletMultiButtonDynamic className="border border-solid" />
      ) : !user ? (
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        <button onClick={authenticate}>Sign</button>
      ) : (
        <div className="flex items-center">
          <div className="flex flex-col ">
            <span className="font-medium">{shortenAddress(user.pubkey)}</span>
            <span
              onClick={logout}
              className="ml-auto cursor-pointer text-sm font-extralight italic text-red-300 hover:underline"
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
