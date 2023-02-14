import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { WagmiConfig, createClient } from "wagmi";
import { ConnectKitProvider, getDefaultClient } from "connectkit";
import { ApolloProvider } from "@apollo/client";
import { client as ApolloClient } from "@/lib/apollo";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorModalProvider } from "@/hooks/useApiError";

const alchemyId = process.env.ALCHEMY_ID;

const client = createClient(
  getDefaultClient({
    appName: "Prop Lot",
    alchemyId,
  })
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Prop Lot</title>
        <meta name="description" content="Vote on nounish ideas." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ApolloProvider client={ApolloClient}>
        <WagmiConfig client={client}>
          <ConnectKitProvider>
            <AuthProvider>
              <ErrorModalProvider>
                <Component {...pageProps} />
              </ErrorModalProvider>
            </AuthProvider>
          </ConnectKitProvider>
        </WagmiConfig>
      </ApolloProvider>
    </>
  );
}
