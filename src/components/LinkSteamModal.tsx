import Image from "next/image";
import Link from "next/link";
import { Modal } from "./Modal";

interface LinkSteamModalProps {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
}

export const LinkSteamModal = ({
  showModal,
  setShowModal,
}: LinkSteamModalProps) => (
  <Modal
    title="Link steam account"
    showModal={showModal}
    setShowModal={setShowModal}
  >
    <div className="relative flex-auto p-6">
      <p className="my-4 text-lg leading-relaxed text-slate-400">
        Log in with your steam account to complete the registration
      </p>

      <Link
        className="mr-1 mb-1 mt-6 flex w-full items-center justify-center gap-6 rounded bg-gray-600 px-6 py-3 text-sm font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:bg-gray-700 hover:shadow-lg focus:outline-none active:bg-gray-700"
        href="/api/auth/login"
      >
        <Image src="/steam-logo.webp" alt="steam-logo" width={30} height={30} />
        Continue with steam
      </Link>
    </div>
  </Modal>
);
