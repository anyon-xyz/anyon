import type { CsgoInventory } from "@anyon/api";
import type { User } from "@prisma/client";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import { useStore } from "../store";

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
      enabled: user !== undefined && user !== null && !!user.steamId,
      retry: 0,
    }
  );

export const useInventory = () => {
  const setCsgoInventory = useStore((state) => state.setCsgoInventory);
  const user = useStore((state) => state.user);
  const [refetchInventory, setRefetchInventory] = useState<boolean>(false);

  const { isFetching: isFetchingInventory, isLoading: isLoadingInventory } =
    useQueryInventory({ refetchInventory, setCsgoInventory, user });

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
