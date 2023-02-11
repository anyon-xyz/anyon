import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useUser } from "../hooks/useUser";
import useStore from "../store";
import { shortenAddress } from "../utils/shortenAddress";
import { Modal } from "./Modal";

interface ProfileModalProps {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
}

export const ProfileModal = ({
  showModal,
  setShowModal,
}: ProfileModalProps) => {
  const user = useStore((state) => state.authUser);
  const { updateTradeOfferUrl } = useUser();
  const [tradeOfferUrl, setTradeOfferUrl] = useState<string>("");

  return (
    <Modal
      title="Edit profile"
      showModal={showModal}
      setShowModal={setShowModal}
      width="w-96"
      // TODO: validate form
      onSaveSubmit={() =>
        user && user.steamId
          ? updateTradeOfferUrl({ steamTradeUrl: tradeOfferUrl })
          : {}
      }
    >
      {user && (
        <div className="flex flex-auto flex-col items-center justify-center p-6">
          <Image
            src={user.pfp || `https://source.boringavatars.com/pixel/120/idk`}
            className="trasition cursor-not-allowed rounded-full delay-100 hover:grayscale"
            width={150}
            height={150}
            alt="profile-picture"
          />

          <div className="my-4 flex w-full flex-col">
            <label className="text-sm">pubkey</label>
            <input
              className="mt-2 rounded bg-slate-900 p-2 text-gray-400"
              defaultValue={shortenAddress(user.pubkey, 6)}
              disabled
            />
          </div>

          {user.steamId ? (
            <div className="my-4 flex w-full flex-col">
              <label className="text-sm">Steam trade offer url</label>
              <input
                className="mt-2 rounded bg-slate-800 p-2"
                onChange={(e) => setTradeOfferUrl(e.target.value)}
                value={user.steamTradeUrl || tradeOfferUrl || ""}
              />
            </div>
          ) : (
            <Link
              className="mr-1 mb-1 mt-6 flex w-full items-center justify-center gap-6 rounded bg-gray-600 px-6 py-3 text-sm font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:bg-gray-700 hover:shadow-lg focus:outline-none active:bg-gray-700"
              href="/api/auth/login"
            >
              <Image
                src="/steam-logo.webp"
                alt="steam-logo"
                width={30}
                height={30}
              />
              Continue with steam
            </Link>
          )}
        </div>
      )}
    </Modal>
  );
};
