import Image from "next/image";
import { ConnectKitButton } from "connectkit";

const Navbar = () => {
  return (
    <main className="pt-8">
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
