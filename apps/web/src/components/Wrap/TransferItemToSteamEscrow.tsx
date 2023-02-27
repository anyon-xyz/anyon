import type { Asset, Description } from "@anyon/api";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Puff } from "react-loading-icons";
import { api } from "~/utils/api";
import { Item } from "./Item";

interface TransferItemToSteamEscrowProps {
  item: Description;
  asset: Asset;
  onNext: () => void;
}

export const TransferItemToSteamEscrow = ({
  item,
  asset,
  onNext,
}: TransferItemToSteamEscrowProps) => {
  const [sentTradeOffer, setSentTradeOffer] = useState<boolean>(false);
  const [isWaitingTradeConfirmation, setIsWaitingTradeConfirmation] =
    useState<boolean>(false);

  const { mutate: onWrap } = api.steam.wrapItem.useMutation({
    onSuccess(data) {
      setSentTradeOffer(true);
      toast(data.message, {
        icon: "✅",
        style: {
          background: "#333",
          color: "#fff",
        },
      });
    },
  });

  api.steam.onSentTradeOffer.useSubscription(
    { assetid: asset.assetid },
    {
      onData(data) {
        if (data.state === 9) {
          toast("Trade offer sent", {
            icon: "✅",
            style: {
              background: "#333",
              color: "#fff",
            },
          });
          setIsWaitingTradeConfirmation(true);
        }

        if (data.state === 3) {
          setIsWaitingTradeConfirmation(false);
          toast("Trade offer successfully confirmed", {
            icon: "✅",
            style: {
              background: "#333",
              color: "#fff",
            },
          });
          onNext();
        }
      },
      onError(e) {
        console.log(e);
      },
    }
  );

  return (
    <>
      <Item item={item} />

      {isWaitingTradeConfirmation ? (
        <div className="mt-4 flex justify-center items-center flex-col">
          <p>Trade offer sent, accept to mint NFT</p>

          <Puff className="mt-2" />
        </div>
      ) : (
        <>
          {sentTradeOffer ? (
            <div className="mt-4 flex justify-center items-center flex-col">
              <p>Sending trade offer...</p>

              <Puff className="mt-2" />
            </div>
          ) : (
            <button
              onClick={() =>
                onWrap({
                  appid: asset.appid,
                  assetid: asset.assetid,
                  contextid: asset.contextid,
                  id: asset.assetid,
                  marketHashName: item.market_hash_name,
                })
              }
              className="mt-5 w-full rounded-xl bg-slate-600 p-3 transition delay-150 duration-200 hover:bg-slate-700"
            >
              Transfer to our steam escrow
            </button>
          )}
        </>
      )}
    </>
  );
};
