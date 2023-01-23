import Head from "next/head";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";

export default function Home() {
  const { address, isConnecting, isDisconnected } = useAccount();

  return (
    <>
      <Head>
        <title>Prop Lot</title>
        <meta name="description" content="Vote on nounish ideas." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <section className="flex justify-between">
          {/* empty span for spacing */}
          <span />
          <h1>Prop Lot</h1>
          <ConnectKitButton />
        </section>
      </main>
    </>
  );
}
