import type { Asset, Description } from "@anyon/api";
import { useEffect, useState } from "react";

import { REDIS_CHANNEL_TRANSFER_STEAM_ITEM } from "@anyon/common";
import { toast } from "react-hot-toast";
import { Puff } from "react-loading-icons";
import { Socket } from "socket.io-client";
import { api } from "~/utils/api";
import { Item } from "./Item";

interface TransferItemToSteamEscrowProps {
  item: Description;
  asset: Asset;
  onNext: () => void;
  onPrev: () => void;
  socket: Socket | null;
}

export const TransferItemToSteamEscrow = ({
  item,
  asset,
  onNext,
  socket,
}: TransferItemToSteamEscrowProps) => {
  const [sendingTradeOffer, setSendingTradeOffer] = useState<boolean>(false);
  const [tradeErrorMsg, setTradeErrorMsg] = useState<string>("");
  const [tradeWarnMsg, setTradeWarnMsg] = useState<string>("");
  const [isWaitingTradeConfirmation, setIsWaitingTradeConfirmation] =
    useState<boolean>(false);

  const { mutate: onWrap } = api.steam.wrapItem.useMutation({
    onSuccess(data) {
      setSendingTradeOffer(true);
      toast(data.message, {
        icon: "✅",
        style: {
          background: "#333",
          color: "#fff",
        },
      });
    },
  });

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => console.log("Connected"));
      socket.emit("transfer-steam-item", { assetid: asset.assetid });
      socket.on(
        REDIS_CHANNEL_TRANSFER_STEAM_ITEM(asset.assetid),
        (data: { state: number; escrowEnds: string }) => {
          const successfullyToast = (msg: string) =>
            toast(msg, {
              icon: "✅",
              style: {
                background: "#333",
                color: "#fff",
              },
            });

          const failedToast = (msg: string) =>
            toast(msg, {
              icon: "❌",
              style: {
                background: "#333",
                color: "#fff",
              },
            });

          // TODO: change to ETradeOfferState enum
          switch (data.state) {
            case 3: {
              setIsWaitingTradeConfirmation(false);
              successfullyToast("Trade offer successfully confirmed");
              onNext();
              return;
            }
            case 9:
            case 2: {
              setIsWaitingTradeConfirmation(true);
              return successfullyToast("Trade offer sent");
            }
            case 7: {
              setIsWaitingTradeConfirmation(false);
              setSendingTradeOffer(false);
              setTradeErrorMsg(
                "You declined the trade offer, send again if you wanna proceed"
              );
              failedToast("Trade offer declined");
              return;
            }
            case 11: {
              setIsWaitingTradeConfirmation(false);
              setSendingTradeOffer(false);
              setTradeWarnMsg(
                `The trade is in steam escrow because you don't have steam guard active for the 7 days.\nEscrow ends in ${new Date(
                  data.escrowEnds
                ).toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}\nAfter this date, if the trade is not cancelled, you can claim your nft when the trade is completed`
              );
              return successfullyToast("Trade offer successfully confirmed");
            }
            default: {
              return failedToast("Unexpected state");
            }
          }
        }
      );

      return () => {
        socket.off(REDIS_CHANNEL_TRANSFER_STEAM_ITEM(asset.assetid));
      };
    }
  }, [asset.assetid, onNext, socket]);

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
          {sendingTradeOffer ? (
            <div className="mt-4 flex justify-center items-center flex-col">
              <p>Sending trade offer...</p>

              <Puff className="mt-2" />
            </div>
          ) : (
            <>
              {tradeErrorMsg && (
                <span className="text-center text-red-400">
                  {tradeErrorMsg}
                </span>
              )}

              {tradeWarnMsg ? (
                <span className="text-center text-yellow-400 ">
                  {tradeWarnMsg}
                </span>
              ) : (
                <button
                  onClick={() =>
                    onWrap({
                      appid: asset.appid,
                      assetid: asset.assetid,
                      contextid: asset.contextid,
                      id: asset.assetid,
                      marketHashName: item.market_hash_name,
                      classid: asset.classid,
                      instanceid: asset.instanceid,
                      steamIconurl: item.icon_url_large,
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
      )}
    </>
  );
};
