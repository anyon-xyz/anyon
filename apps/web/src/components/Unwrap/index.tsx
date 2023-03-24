import { Description } from "@anyon/api";
import { useEffect, useMemo, useRef, useState } from "react";
import { GiGlock, GiHole, GiOverdrive } from "react-icons/gi";
import { io, Socket } from "socket.io-client";
import { env } from "~/env.mjs";
import { useStore } from "../../store";
import { Modal } from "../Modal";
import { Stepper } from "../Stepper";

interface UnwrapProps {
  item: Description;
}

const connectSocketIoServer = () => {
  const socket = io(env.NEXT_PUBLIC_WS_ENDPOINT, {
    transports: ["websocket"],
  });

  socket.onAny((data) => console.log(data));

  return socket;
};

export const Unwrap = ({ item }: UnwrapProps) => {
  const { getItemAssetByClassId, openUnwrapModal, setOpenUnwrapModal } =
    useStore((state) => ({
      openUnwrapModal: state.openUnwrapModal,
      setOpenUnwrapModal: state.setOpenUnwrapModal,
      getItemAssetByClassId: state.getItemAssetByClassId,
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

  const unwrapFlow = [<>unwrap</>];

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
      showModal={openUnwrapModal}
      setShowModal={setOpenUnwrapModal}
      title="Unwrap NFT"
      description="Complete the steps below to get the item on your Steam account"
      onClose={() => {
        setStep(0);
      }}
      onSaveSubmit={undefined}
    >
      <div className="flex h-auto min-h-[540px] flex-col items-center  p-5">
        <Stepper currentStep={step} steps={steps} />
        <div className="flex w-full flex-col items-center px-4">
          {unwrapFlow[step]}
        </div>
      </div>
    </Modal>
  );
};
