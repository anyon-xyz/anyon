import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { useStore } from "../store";
import { api } from "../utils/api";

export const useInventory = () => {
  const setCsgoInventory = useStore((state) => state.setCsgoInventory);
  const user = useStore((state) => state.user);
  const [refetchInventory, setRefetchInventory] = useState<boolean>(false);

  const { isFetching: isFetchingInventory, isLoading: isLoadingInventory } =
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
        enabled: user !== undefined && user !== null && !!user.steamId,
        retry: 0,
      }
    );

  const onRefetchInventory = useCallback(() => {
    setRefetchInventory(true);

    toast("Inventory updated successfully", {
      icon: "✅",
      style: {
        background: "#333",
        color: "#fff",
      },
    });
  }, []);

  return {
    isFetchingInventory,
    isLoadingInventory,
    onRefetchInventory,
  };
};
