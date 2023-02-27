import type { Asset, Description } from "@anyon/api";
import { toast } from "react-hot-toast";
import { Puff } from "react-loading-icons";
import { api } from "~/utils/api";
import { Item } from "./Item";

interface TransferItemToSteamEscrowProps {
  item: Description;
  asset: Asset;
  onNext: () => void;
}

export const MintNft = ({
  item,
  onNext,
  asset,
}: TransferItemToSteamEscrowProps) => {
  api.steam.onMintItemNft.useSubscription(
    { assetid: asset.assetid },
    {
      onData(data) {
        if (data.state === 3 && data.nftMint) {
          toast("NFT Minted", {
            icon: "✅",
            style: {
              background: "#333",
              color: "#fff",
            },
          });
          onNext();
        }

        console.log(data);
      },
      onError(e) {
        console.log(e);
      },
    }
  );

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
