import { Description } from "@anyon/api";
import { useEffect, useMemo, useRef, useState } from "react";
import { GiGlock, GiHole, GiOverdrive } from "react-icons/gi";
import { io, Socket } from "socket.io-client";
import { useStore } from "../../store";
import { Modal } from "../Modal";
import { Stepper } from "../Stepper";
import { Claim } from "./Claim";
import { MintNft } from "./MintNft";
import { TransferItemToSteamEscrow } from "./TransferItemToSteamEscrow";

interface WrapProps {
  item: Description;
}

const connectSocketIoServer = () => {
  const socket = io("ws://localhost:8000", { transports: ["websocket"] });

  socket.onAny((data) => console.log(data));

  return socket;
};

export const Wrap = ({ item }: WrapProps) => {
  const {
    openWrapModal,
    setOpenWrapModal,
    getItemAssetByClassId,
    setSelectItemToWrap,
  } = useStore((state) => ({
    openWrapModal: state.openWrapModal,
    getItemAssetByClassId: state.getItemAssetByClassId,
    setOpenWrapModal: state.setOpenWrapModal,
    setSelectItemToWrap: state.setSelectItemToWrap,
  }));

  const [step, setStep] = useState<number>(0);
  const asset = useMemo(
    () => getItemAssetByClassId(item.classid, item.appid, item.instanceid),

    [getItemAssetByClassId, item]
  );
  const socketRef = useRef<Socket | null>(connectSocketIoServer());

  const nextStep = () => setStep((prevStep) => prevStep + 1);

  const prevStep = () => setStep((prevStep) => prevStep - 1);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("connect", () => console.log("Connected"));
    }

    return () => {
      if (socketRef.current) {
        console.log("disconecting");
        socketRef.current.emit("unsub", { assetid: asset.assetid });
        // hack to unsub first
        new Promise((resolve) => setTimeout(resolve, 500))
          .then(() => {
            if (socketRef.current) {
              console.log("disconnected");
              socketRef.current.off();
              socketRef.current.disconnect();
              socketRef.current = null;
            }
          })
          .catch(console.error);
      }
    };
  }, [asset.assetid]);

  console.log(step);

  const wrapFlow = [
    <TransferItemToSteamEscrow
      asset={asset}
      key={item.classid}
      item={item}
      socket={socketRef.current}
      onNext={() => nextStep()}
      onPrev={() => prevStep()}
    />,
    <MintNft
      item={item}
      socket={socketRef.current}
      asset={asset}
      key={item.classid}
      onNext={() => nextStep()}
    />,
    <Claim item={item} asset={asset} key={item.classid} />,
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
      onClose={() => {
        setStep(0);
        setSelectItemToWrap(null);
      }}
      onSaveSubmit={undefined}
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
