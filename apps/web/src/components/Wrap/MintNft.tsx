import type { Asset, Description } from "@anyon/api";
import { REDIS_CHANNEL_MINT_STEAM_ITEM } from "@anyon/common";
import { useEffect } from "react";
import { Puff } from "react-loading-icons";
import { Socket } from "socket.io-client";
import { Item } from "./Item";

interface TransferItemToSteamEscrowProps {
  item: Description;
  asset: Asset;
  onNext: () => void;
  socket: Socket | null;
}

export const MintNft = ({
  item,
  onNext,
  asset,
  socket,
}: TransferItemToSteamEscrowProps) => {
  useEffect(() => {
    if (socket) {
      socket.on(REDIS_CHANNEL_MINT_STEAM_ITEM(asset.assetid), () => {
        console.log("minted");
        onNext();
        return;
      });
      socket.emit("mint-item", { assetid: asset.assetid });

      return () => {
        socket.off(REDIS_CHANNEL_MINT_STEAM_ITEM(asset.assetid))
      };
    }
  }, [asset.assetid, onNext, socket]);

  return (
    <>
      <Item item={item} />
      <div className="mt-4 flex justify-center items-center flex-col">
        <p>Minting item...</p>

        <Puff className="mt-2" />
      </div>
    </>
  );
};
