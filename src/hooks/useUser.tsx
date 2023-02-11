import { useWallet } from "@solana/wallet-adapter-react";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { useCallback } from "react";
import { toast } from "react-hot-toast";
import useStore from "../store";
import { api } from "../utils/api";
import { createAuthToken } from "../utils/createAuthToken";

export const useUser = () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { publicKey, signMessage, disconnect } = useWallet();
  const setAuthUser = useStore((state) => state.setAuthUser);
  const setShowSteamLinkModal = useStore(
    (state) => state.setShowSteamLinkModal
  );
  const setShowProfileModal = useStore((state) => state.setShowProfileModal);
  const authUser = useStore((state) => state.authUser);

  const { isLoading: isSigning, mutate: signIn } = api.auth.login.useMutation({
    onSuccess(data) {
      setCookie("auth-jwt", data.authorization, {
        maxAge: 1000 * 60 * 60 * 12, // 12h
      });
      setAuthUser(data.user);

      // show modal to link steam if user does not have steamid;
      if (!data.user.steamId) {
        toast("Successful login", {
          icon: "✅",
          style: {
            background: "#333",
            color: "#fff",
          },
        });
        setShowSteamLinkModal(true);
      }
    },
    onError() {
      deleteCookie("auth-jwt");
      toast.error("Failed to sign in. Refresh the page and try it again");
    },
  });

  // TODO: validate the link
  const { mutate: updateTradeOfferUrl } =
    api.user.updateTradeOfferUrl.useMutation({
      onSuccess(data) {
        toast("'steamTradeUrl' updated", {
          icon: "✅",
          style: {
            background: "#333",
            color: "#fff",
          },
        });
        setAuthUser(data);
        setShowProfileModal(false);
      },
      onError() {
        toast.error("Failed to update. Refresh the page and try it again");
      },
    });

  const { isFetching: isFetchingUser } = api.user.me.useQuery(
    undefined, // no input
    {
      onSuccess(user) {
        setAuthUser(user);
        if (!user.steamId) {
          setShowSteamLinkModal(true);
        }
      },
      onError() {
        deleteCookie("auth-jwt");
        toast.error(
          "Failed to fetch current user. Refresh the page and try sign in again"
        );
      },
      // on error -> reset auth-jwt cookie
      enabled: !authUser && !!getCookie("auth-jwt"),
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const authenticate = useCallback(async () => {
    if (publicKey && signMessage) {
      const signature = await createAuthToken({ publicKey, signMessage });
      signIn({
        signature,
      });
    }
  }, [publicKey, signIn, signMessage]);

  const logout = useCallback(() => {
    disconnect()
      .then(() => {
        deleteCookie("auth-jwt");
        setAuthUser(null);
      })
      .catch(console.error);
  }, [disconnect, setAuthUser]);

  return {
    authenticate,
    isSigning,
    logout,
    isFetchingUser,
    updateTradeOfferUrl,
  };
};
