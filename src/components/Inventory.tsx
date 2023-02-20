import type { CsgoInventory } from "../server/api/services/steam-service";
import { ItemCard } from "./ItemCard";

interface InventoryProps {
  csgoInventory: CsgoInventory | null;
}

export const Inventory = ({ csgoInventory }: InventoryProps) => {
  if (!csgoInventory || csgoInventory.descriptions.length === 0) {
    return <div>No items found in your inventory</div>;
  }

  return (
    <div className="md grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
      {csgoInventory.descriptions
        .filter((item) => item.tradable === 1)
        .slice(0, 12)
        .map((item) => (
          <ItemCard key={item.classid} item={item} />
        ))}
    </div>
  );
};
