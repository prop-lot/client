import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { WagmiConfig, createClient } from "wagmi";
import { ConnectKitProvider, getDefaultClient } from "connectkit";
import { ApolloProvider } from "@apollo/client";
import { client as ApolloClient } from "@/lib/apollo";

import "../styles/globals.css";

const alchemyId = process.env.ALCHEMY_ID;

const client = createClient(
  getDefaultClient({
    appName: "Prop Lot",
    alchemyId,
  })
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={ApolloClient}>
      <WagmiConfig client={client}>
        <ConnectKitProvider>
          <Component {...pageProps} />
        </ConnectKitProvider>
      </WagmiConfig>
    </ApolloProvider>
  );
}
