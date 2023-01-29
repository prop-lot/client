import Image from "next/image";
import Router from 'next/router';
import { ConnectKitButton } from "connectkit";

const NavBar = () => {
  return (
    <nav className="flex justify-between max-w-screen-xl mx-auto px-8 py-8">
      <Image
        src="/logo.svg"
        alt="PropLot logo, which is a car noun with text spelling prop lot."
        width="140"
        height="120"
        className="cursor-pointer"
        onClick={() => Router.push('/')}
      />
      <ConnectKitButton />
    </nav>
  )
}

export default NavBar;