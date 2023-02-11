import Image from "next/image";
import type { Description } from "../server/api/services/steam-service";
import { getStickerImageFromCsgoItem } from "../utils/getStickerImageFromCsgoItem";

interface ItemCardProps {
  item: Description;
}

export const ItemCard = ({ item }: ItemCardProps) => (
  <div
    key={item.classid}
    className="flex max-w-xs flex-1 flex-col gap-4 rounded-xl bg-white/10 p-4 text-white"
  >
    <h3
      onClick={() => window.open(item.market_actions[0]?.link)}
      className="cursor-pointer text-lg font-bold hover:underline"
    >
      {item.name}
    </h3>

    <div className="flex flex-col items-center justify-center">
      <Image
        key={item.classid}
        width={150}
        height={150}
        src={`https://steamcommunity-a.akamaihd.net/economy/image/${item.icon_url_large}`}
        alt="item"
      />
      {/* stickers */}

      {item.descriptions && (
        <div className="mt-2 flex">
          {getStickerImageFromCsgoItem(item.descriptions).map((imgUrl, i) => (
            <Image key={i} width={40} height={40} src={imgUrl} alt="item" />
          ))}
        </div>
      )}
    </div>

    <button className="mt-auto rounded-xl bg-slate-400 p-2 transition delay-150 duration-300  hover:-translate-y-1 hover:bg-slate-600 ">
      wrap into nft
    </button>
  </div>
);
