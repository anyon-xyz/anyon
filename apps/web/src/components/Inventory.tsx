import { toast } from "react-hot-toast";
import { useStore } from "../store";
import { ItemCard } from "./ItemCard";

export const Inventory = () => {
  const {
    setSelectItemToWrap,
    csgoInventory,
    setOpenWrapModal,
    user,
    setShowProfileModal,
  } = useStore((state) => ({
    csgoInventory: state.csgoInventory,
    setSelectItemToWrap: state.setSelectItemToWrap,
    setOpenWrapModal: state.setOpenWrapModal,
    user: state.user,
    setShowProfileModal: state.setShowProfileModal,
  }));

  if (!csgoInventory || csgoInventory.descriptions.length === 0) {
    return <div>No items found in your inventory</div>;
  }

  return (
    <div className="md grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
      {csgoInventory.descriptions
        .filter((item) => item.tradable === 1)
        .slice(0, 12)
        .map((item) => (
          <ItemCard
            onWrap={(item) => {
              if (user && !user.steamTradeUrl) {
                toast(
                  "Link the Steam Trade Offer URL to your account before wrapping an item",
                  {
                    icon: "❌",
                    style: {
                      background: "#333",
                      color: "#fff",
                    },
                  }
                );

                setShowProfileModal(true);
              } else {
                setSelectItemToWrap(item);
                setOpenWrapModal(true);
              }
            }}
            key={item.classid}
            item={item}
          />
        ))}
    </div>
  );
};
