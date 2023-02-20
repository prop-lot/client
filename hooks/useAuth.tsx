import { useContext, createContext, ReactNode, useState, useEffect, useCallback } from "react";
import { useAccount, useNetwork, useSignMessage } from 'wagmi'
import { SiweMessage } from "siwe";

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
    loading?: boolean
    nonce?: string
    error?: Error
    currentUser?: string
  }>({})

  const fetchNonce = async () => {
    try {
      const nonceRes = await fetch('/api/nonce')
      const nonce = await nonceRes.text()
      setState((x) => ({ ...x, nonce }))
    } catch (error) {
      setState((x) => ({ ...x, error: error as Error }))
    }
  }

  // Pre-fetch random nonce when button is rendered
  // to ensure deep linking works for WalletConnect
  // users on iOS when signing the SIWE message
  useEffect(() => {
    fetchNonce()
  }, [])

  // Fetch user when:
  useEffect(() => {
    const handler = async () => {
      try {
        const res = await fetch('/api/current-user')
        const json = await res.json()

        setState((x) => ({ ...x, currentUser: json.address }))
      } catch (_error) {}
    }
    // 1. page loads
    handler()

    // 2. window is focused (in case user logs out of another window)
    window.addEventListener('focus', handler)
    return () => window.removeEventListener('focus', handler)
  }, [])

  const { address } = useAccount()
  const { chain } = useNetwork()
  const { signMessageAsync } = useSignMessage()

  const signIn = async () => {
    try {
      const chainId = chain?.id
      if (!address || !chainId) {
        throw new Error('Web3 provider not available')
      }

      setState((x) => ({ ...x, loading: true }))
      // Create SIWE message with pre-fetched nonce and sign with wallet
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in with Ethereum to Prop Lot.',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce: state.nonce,
      })
      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      })

      // Verify signature
      const verifyRes = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, signature }),
      })

      if (!verifyRes.ok) {
        throw new Error('Error verifying message')
      }

      setState((x) => ({ ...x, loading: false, currentUser: address }))
      return { success: true }
    } catch (error) {
      setState((x) => ({ ...x, loading: false, nonce: undefined, error: error as Error }))
      fetchNonce()
      return { success: false }
    }
  }

  const logout = useCallback(async () => {
    try {
      if (state.currentUser) {
        await fetch('/api/logout')
        setState({})
        fetchNonce()
      }
    } catch (_error) {
      setState({})
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
