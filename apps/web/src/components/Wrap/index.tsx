import type { Description } from "@anyon/api";
import { useState } from "react";
import { GiGlock, GiHole, GiOverdrive } from "react-icons/gi";
import { useStore } from "../../store";
import { Modal } from "../Modal";
import { Stepper } from "../Stepper";
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
    })
  );
  const [step, setStep] = useState<number>(0);

  const nextStep = () => setStep((prevStep) => prevStep + 1);
  const prevStep = () => {
    if (step > 0) setStep((prevStep) => prevStep - 1);
  };

  const wrapFlow = [
    <TransferItemToSteamEscrow
      asset={getItemAssetByClassId(item.classid)!}
      key={item.classid}
      item={item}
      onNext={() => nextStep()}
    />,
    <h1 key={1} onClick={prevStep}>
      next step
    </h1>,
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
    >
      <div className="flex h-auto min-h-[540px] flex-col items-center  p-5">
        <Stepper currentStep={step} steps={steps} />
        {wrapFlow[step]}
      </div>
    </Modal>
  );
};
