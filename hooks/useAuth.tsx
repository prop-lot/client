import {
  useContext,
  createContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAccount, useNetwork, useSignMessage, usePublicClient } from "wagmi";
import { SiweMessage, checkContractWalletSignature } from "siwe";
import pRetry from "p-retry";

import MultiSigAuthModal from "@/components/MultiSigAuthModal";

const AVERAGE_BLOCK_TIME_IN_SECONDS = 13;

interface AuthCtx {
  isLoggedIn: boolean;
  triggerSignIn: () => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({
  isLoggedIn: false,
  triggerSignIn: async () => undefined,
  logout: () => undefined,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<{
    loading?: boolean;
    nonce?: string;
    error?: Error;
    currentUser?: string;
  }>({});

  const fetchNonce = async () => {
    try {
      const nonceRes = await fetch("/api/nonce");
      const nonce = await nonceRes.text();
      setState((x) => ({ ...x, nonce }));
    } catch (error) {
      setState((x) => ({ ...x, error: error as Error }));
    }
  };

  // Pre-fetch random nonce when button is rendered
  // to ensure deep linking works for WalletConnect
  // users on iOS when signing the SIWE message
  useEffect(() => {
    fetchNonce();
  }, []);

  // Fetch user when:
  useEffect(() => {
    const handler = async () => {
      try {
        const res = await fetch("/api/current-user");
        const json = await res.json();

        setState((x) => ({ ...x, currentUser: json.address }));
      } catch (_error) {}
    };
    // 1. page loads
    handler();

    // 2. window is focused (in case user logs out of another window)
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, []);

  const { address } = useAccount();
  const provider = usePublicClient();
  const { chain } = useNetwork();
  const { signMessageAsync } = useSignMessage();
  const defaultState = {
    isOpen: false,
    title: "",
    content: "",
    authStatus: "",
  };
  const [multisigAuthStatus, setMultisigAuthStatus] = useState(defaultState);

  const signIn = async () => {
    try {
      const chainId = chain?.id;
      if (!address || !chainId) {
        throw new Error("Web3 provider not available");
      }

      const isContractAccount =
        (await provider.getBytecode({ address })) !== "0x";

      setState((x) => ({ ...x, loading: true }));
      // Create SIWE message with pre-fetched nonce and sign with wallet
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in with Ethereum to Prop Lot.",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce: state.nonce,
      });

      if (isContractAccount) {
        setMultisigAuthStatus({
          authStatus: "CONFIRMING",
          isOpen: true,
          title: "Awaiting Signatures",
          content:
            "Do not close this modal. Go to your safe and ensure all transactions are signed.",
        });
      }

      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });

      if (isContractAccount) {
        // wait for tx to go through
        await pRetry(
          async () => {
            const valid = await checkContractWalletSignature(
              message,
              signature,
              // @ts-ignore -- I'm assuming this is okay since publicClient is WAGMI provider.
              provider
            );

            if (!valid) {
              throw new Error("Not yet a valid contract signature...");
            }
          },
          {
            forever: true,
            minTimeout: AVERAGE_BLOCK_TIME_IN_SECONDS * 1000,
            maxTimeout: 5 * AVERAGE_BLOCK_TIME_IN_SECONDS * 1000,
          }
        );
      }

      // Verify signature
      const verifyRes = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, signature }),
      });

      if (!verifyRes.ok) {
        throw new Error("Error verifying message");
      }

      if (isContractAccount) {
        setMultisigAuthStatus({
          authStatus: "CONFIRMED",
          isOpen: true,
          title: "Transaction Signed!",
          content: "You are now logged in and you can close this modal.",
        });
      }

      setState((x) => ({ ...x, loading: false, currentUser: address }));
      return { success: true };
    } catch (error) {
      setState((x) => ({
        ...x,
        loading: false,
        nonce: undefined,
        error: error as Error,
      }));
      fetchNonce();
      setMultisigAuthStatus(defaultState);
      return { success: false };
    }
  };

  const logout = useCallback(async () => {
    try {
      if (state.currentUser) {
        await fetch("/api/logout");
        setState({});
        fetchNonce();
      }
    } catch (_error) {
      setState({});
    }
  }, [state.currentUser]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!state.currentUser,
        triggerSignIn: signIn,
        logout,
      }}
    >
      {children}
      {multisigAuthStatus?.isOpen && (
        <MultiSigAuthModal
          {...multisigAuthStatus}
          onDismiss={() => {
            setMultisigAuthStatus(defaultState);
          }}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
