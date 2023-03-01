import type { Description } from "@anyon/api";
import { useMemo, useState } from "react";
import { GiGlock, GiHole, GiOverdrive } from "react-icons/gi";
import { useStore } from "../../store";
import { Modal } from "../Modal";
import { Stepper } from "../Stepper";
import { Claim } from "./Claim";
import { MintNft } from "./MintNft";
import { TransferItemToSteamEscrow } from "./TransferItemToSteamEscrow";

interface WrapProps {
  item: Description;
}

export const Wrap = ({ item }: WrapProps) => {
  const { openWrapModal, setOpenWrapModal, getItemAssetByClassId } = useStore(
    (state) => ({
      openWrapModal: state.openWrapModal,
      setOpenWrapModal: state.setOpenWrapModal,
      getItemAssetByClassId: state.getItemAssetByClassId,
      user: state.user,
    })
  );
  const [step, setStep] = useState<number>(0);
  const asset = useMemo(
    () => getItemAssetByClassId(item.classid, item.appid, item.instanceid),
    [getItemAssetByClassId, item.appid, item.classid, item.instanceid]
  );

  const nextStep = () => setStep((prevStep) => prevStep + 1);

  const wrapFlow = [
    <TransferItemToSteamEscrow
      asset={asset}
      key={item.classid}
      item={item}
      onNext={() => nextStep()}
    />,
    <MintNft
      item={item}
      asset={asset}
      key={item.classid}
      onNext={() => nextStep()}
    />,
    <Claim
      item={item}
      asset={asset}
      key={item.classid}
      onNext={() => nextStep()}
    />,
  ];

  const steps = [
    {
      title: "Transfer item",
      icon: <GiGlock size={28} />,
    },
    {
      title: "Mint NFT",
      icon: <GiHole />,
    },
    {
      title: "Finish",
      icon: <GiOverdrive />,
    },
  ];

  return (
    <Modal
      className="w-full max-w-xl shadow-lg shadow-red-500/40"
      showModal={openWrapModal}
      setShowModal={setOpenWrapModal}
      title="Wrap skin into Solana NFT"
      description="Complete the steps below to wrap your skin into NFT"
      onClose={() => setStep(0)}
    >
      <div className="flex h-auto min-h-[540px] flex-col items-center  p-5">
        <Stepper currentStep={step} steps={steps} />
        <div className="flex w-full flex-col items-center px-4">
          {wrapFlow[step]}
        </div>
      </div>
    </Modal>
  );
};
