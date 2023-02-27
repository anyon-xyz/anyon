import { Description } from "@anyon/api";
import Image from "next/image";
import { getStickerImageFromCsgoItem } from "~/utils/getStickerImageFromCsgoItem";

interface ItemProps {
  item: Description;
}
export const Item = ({ item }: ItemProps) => (
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
  </div>
);
