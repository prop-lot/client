import Image from "next/image";
import { ConnectKitButton } from "connectkit";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const { isDisconnected } = useAccount();
  const { isLoggedIn, logout } = useAuth();

  // Logout when a user changes their wallet in their browser extension
  useEffect(() => {
    const handleAccountsChanged = async () => {
      await logout();
    }

    if (!!window.ethereum) {
      //@ts-ignore
      window.ethereum?.on('accountsChanged', handleAccountsChanged)
    }

    return () => {
      //@ts-ignore
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
    }
  }, [logout]) // eslint-disable-line

  // Logout when a user disconnects their wallet from the connectKit provider
  useEffect(() => {
    if (isDisconnected) {
      logout();
    }
  }, [isDisconnected]); // eslint-disable-line

  return (
    <main className="pt-8 px-[20px] xl:px-0">
      <section className="max-w-screen-xl mx-auto">
        <nav className="flex justify-between">
          <Image
            src="/logo.svg"
            alt="PropLot logo, which is a car noun with text spelling prop lot."
            width="140"
            height="120"
          />
          <ConnectKitButton />
        </nav>
      </section>
    </main>
  );
};

export default Navbar;
