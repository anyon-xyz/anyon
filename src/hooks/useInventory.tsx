import { toast } from "react-hot-toast";
import useStore from "../store";
import { api } from "../utils/api";

export const useInventory = () => {
  const setCsgoInventory = useStore((state) => state.setCsgoInventory);
  const authUser = useStore((state) => state.authUser);

  const { isFetching: isFetchingInventory, isLoading: isLoadingInventory } =
    api.steam.getCsgoInventory.useQuery(
      undefined, // no input
      {
        onSuccess(data) {
          setCsgoInventory(data);
        },
        onError(err) {
          console.log("err", err);
          toast("Fail to fetch csgo inventory", {
            icon: "❌",
            style: {
              background: "#333",
              color: "#fff",
            },
          });
        },
        enabled:
          authUser !== undefined && authUser !== null && !!authUser.steamId,
        retry: 0,
        cacheTime: 5,
      }
    );

  return {
    isFetchingInventory,
    isLoadingInventory,
  };
};
