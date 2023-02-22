import type { Asset, Description } from "@anyon/api";
import Image from "next/image";
import { api } from "~/utils/api";
import { getStickerImageFromCsgoItem } from "~/utils/getStickerImageFromCsgoItem";

interface TransferItemToSteamEscrowProps {
  item: Description;
  asset: Asset;
  onNext: () => void;
}

export const TransferItemToSteamEscrow = ({
  item,
  asset,
}: TransferItemToSteamEscrowProps) => {
  const { mutate: onWrap } = api.steam.wrapItem.useMutation({
    onSuccess(data) {
      console.log(data);
    },
  });

  return (
    <div className="flex w-full flex-col items-center px-4">
      <h1
        className="mb-4 cursor-pointer text-xl font-extrabold tracking-tight hover:underline"
        onClick={() => window.open(item.market_actions[0]?.link)}
      >
        {item.name}
      </h1>

      <Image
        key={item.classid}
        width={250}
        height={250}
        className="cursor-pointer"
        onClick={() => window.open(item.market_actions[0]?.link)}
        src={`https://steamcommunity-a.akamaihd.net/economy/image/${item.icon_url_large}`}
        alt="item"
      />

      <div className="mt-2 mb-4 flex justify-center">
        {getStickerImageFromCsgoItem(item.descriptions).map((imgUrl, i) => (
          <Image key={i} width={80} height={80} src={imgUrl} alt="item" />
        ))}
      </div>

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
        className="mt-5 w-full rounded-xl bg-slate-600 p-3 transition delay-150 duration-200 hover:bg-slate-700 "
      >
        Transfer to our steam escrow
      </button>
    </div>
  );
};
