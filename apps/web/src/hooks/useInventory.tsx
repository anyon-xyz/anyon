import type { CsgoInventory } from "@anyon/api";
import type { User } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import { useStore } from "../store";
import { useDebounce } from "./useDebounce";

export const useQueryInventory = ({
  refetchInventory,
  setCsgoInventory,
  user,
}: {
  refetchInventory: boolean;
  setCsgoInventory: (inventory: CsgoInventory) => void;
  user?: User | null;
}) =>
  api.steam.getCsgoInventory.useQuery(
    { forceFetch: refetchInventory },
    {
      onSuccess(data) {
        setCsgoInventory(data);
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
      enabled: !!user && !!user.steamId,
      retry: 3,
      refetchOnWindowFocus: false,
    }
  );

export const useInventory = () => {
  const { setCsgoInventory, csgoInventory } = useStore((state) => ({
    setCsgoInventory: state.setCsgoInventory,
    csgoInventory: state.csgoInventory,
  }));
  const user = useStore((state) => state.user);
  const [forceFetch, setForceFetch] = useState(false);
  const [searchInventoryItem, setSearchInventoryItem] = useState<string>("");

  const {
    isFetching: isFetchingInventory,
    isLoading: isLoadingInventory,
    refetch,
  } = useQueryInventory({
    refetchInventory: forceFetch,
    setCsgoInventory,
    user,
  });

  const onRefetchInventory = useCallback((forceFetch: boolean) => {
    setForceFetch(forceFetch);

    toast("Inventory updated", {
      icon: "✅",
      style: {
        background: "#333",
        color: "#fff",
      },
    });
  }, []);

  const searchItemByName = useCallback(
    (itemName: string) => {
      if (csgoInventory) {
        const searchResult = csgoInventory.descriptions.filter((item) =>
          item.market_name
            .toLocaleLowerCase()
            .includes(itemName.toLocaleLowerCase())
        );

        const searchInventoryResult: CsgoInventory = {
          ...csgoInventory,
          descriptions: searchResult,
          assets: csgoInventory.assets.filter((asset) =>
            searchResult.find(
              (item) =>
                asset.classid === item.classid &&
                asset.appid === item.appid &&
                asset.instanceid === item.instanceid
            )
          ),
        };

        return searchInventoryResult;
      }
    },
    [csgoInventory]
  );

  const debouncedSearchInventoryItem: string = useDebounce<string>(
    searchInventoryItem,
    500
  );

  useEffect(
    () => {
      if (debouncedSearchInventoryItem) {
        const searchItemResult = searchItemByName(debouncedSearchInventoryItem);

        setCsgoInventory(searchItemResult || ([] as unknown as CsgoInventory));
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedSearchInventoryItem] // Only call effect if debounced search term changes
  );

  return {
    isFetchingInventory,
    isLoadingInventory,
    onRefetchInventory,
    setSearchInventoryItem,
    refetchInventory: refetch,
  };
};
