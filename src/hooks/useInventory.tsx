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
          console.log("here", err);
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
