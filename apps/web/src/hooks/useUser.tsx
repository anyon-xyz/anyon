import { createAuthToken, MAX_AGE_MS } from "@anyon/common";
import { useWallet } from "@solana/wallet-adapter-react";
import { deleteCookie, setCookie } from "cookies-next";
import { useCallback } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import { resetAllStores, useStore } from "../store";

export const useMeQuery = () => {
  const meQuery = api.user.me.useQuery(undefined, {
    retry(failureCount) {
      return failureCount > 3;
    },
    refetchOnWindowFocus: false,
  });

  return meQuery;
};

export const useUser = () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { publicKey, signMessage, disconnect } = useWallet();
  const { setShowSteamLinkModal, setUser } = useStore((state) => ({
    setShowSteamLinkModal: state.setShowSteamLinkModal,
    setUser: state.setUser,
  }));

  const setShowProfileModal = useStore((state) => state.setShowProfileModal);

  const { isLoading: isSigning, mutate: signIn } = api.auth.login.useMutation({
    onSuccess(data) {
      setCookie("auth-jwt", data.authorization, {
        maxAge: MAX_AGE_MS, // 12h
      });
      setUser(data.user);

      toast("Successful login", {
        icon: "✅",
        style: {
          background: "#333",
          color: "#fff",
        },
      });

      // show modal to link steam if user does not have steamid;
      if (!data.user.steamId) {
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
        setUser(data);
        setShowProfileModal(false);
        toast("'steamTradeUrl' updated", {
          icon: "✅",
          style: {
            background: "#333",
            color: "#fff",
          },
        });
      },
      onError() {
        toast.error("Failed to update. Refresh the page and try it again");
      },
    });

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
        resetAllStores();
      })
      .catch(console.error);
  }, [disconnect]);

  return {
    authenticate,
    isSigning,
    logout,
    updateTradeOfferUrl,
  };
};
