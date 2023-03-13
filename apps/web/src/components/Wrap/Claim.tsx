import type { Asset, Description } from "@anyon/api";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { useCallback, useState } from "react";
import ConfettiExplosion from "react-confetti-explosion";
import { toast } from "react-hot-toast";
import { Puff } from "react-loading-icons";
import { api } from "~/utils/api";
import { Item } from "./Item";

interface TransferItemToSteamEscrowProps {
  item: Description;
  asset: Asset;
}

export const Claim = ({ item, asset }: TransferItemToSteamEscrowProps) => {
  const { signMessage } = useWallet();
  const { connection } = useConnection();
  const [isExploding, setIsExploding] = useState<boolean>(false);

  const {
    mutate: claim,
    isLoading,
    data,
  } = api.steam.claimItem.useMutation({
    onSuccess(data) {
      toast("Successfully claimed", {
        icon: "✅",
        style: {
          background: "#333",
          color: "#fff",
        },
      });
      console.log(data);
      setIsExploding(true);
    },
    onError(err) {
      toast(err.message, {
        icon: "❌",
        style: {
          background: "#333",
          color: "#fff",
        },
      });
    },
  });

  const onClaim = useCallback(
    async (assetid: string) => {
      if (signMessage && connection) {
        try {
          const message = `Claim item ${assetid}`;
          const encodedMessage = new TextEncoder().encode(message);
          const sign = await signMessage(encodedMessage);

          const bs58signature = bs58.encode(sign);

          claim({
            appid: item.appid,
            assetid: asset.assetid,
            contextid: asset.contextid,
            classid: item.classid,
            instanceid: item.instanceid,
            signature: bs58signature,
          });
        } catch (error) {
          if (error instanceof Error) {
            toast.error(`Transaction failed: ${error.message}`);
          }
        }
      }
    },
    [
      asset.assetid,
      asset.contextid,
      claim,
      connection,
      item.appid,
      item.classid,
      item.instanceid,
      signMessage,
    ]
  );

  return (
    <>
      <Item item={item} />

      {isLoading ? (
        <div className="mt-5 flex flex-col items-center justify-center">
          <Puff />
          <p className="mt-2">Getting your item</p>
        </div>
      ) : (
        <>
          {data && data.tx ? (
            <div>
              Item successfully wrapped. Check your wallet to see your nft
            </div>
          ) : (
            <button
              onClick={() =>
                // claim({
                //   appid: item.appid,
                //   assetid: asset.assetid,
                //   contextid: asset.contextid,
                //   classid: item.classid,
                //   instanceid: item.instanceid,
                // })
                void onClaim(asset.assetid)
              }
              className="mt-5 w-full rounded-xl bg-slate-600 p-3 transition delay-150 duration-200 hover:bg-slate-700"
            >
              Transfer item to my wallet
            </button>
          )}
        </>
      )}

      {isExploding && (
        <ConfettiExplosion force={0.8} duration={5000} particleCount={250} />
      )}
    </>
  );
};
