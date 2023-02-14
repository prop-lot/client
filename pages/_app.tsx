import { useEffect, useState } from "react";
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
import LandingPage from "@/components/LandingPage";
import NavBar from "@/components/Navbar";

const alchemyId = process.env.ALCHEMY_ID;

const client = createClient(
  getDefaultClient({
    appName: "Prop Lot",
    alchemyId,
  })
);

const LandingPageApp = () => {
  return (
    <>
      <Head>
        <title>Prop Lot</title>
        <meta name="description" content="Vote on nounish ideas." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <LandingPage />
    </>
  );
};

export default function App({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [community, setCommunity] = useState<any>();

  useEffect(() => {
    const getCommunity = async () => {
      const host = window.location.host;
      console.log(host);
      const subdomain =
        process.env.NODE_ENV === "development"
          ? host?.match(/(.*)\.localhost:3000/)
          : host?.match(/(.*)\.proplot\.wtf/);

      if (!subdomain) {
        setCommunity(null);
        setLoading(false);
      } else {
        const communityName = subdomain[1];
        const response = await fetch("/api/communityByName", {
          method: "POST",
          body: JSON.stringify({ name: communityName }),
        });
        const data = await response.json();
        const community = data?.community;

        setCommunity(community);
        setLoading(false);
      }
    };

    getCommunity();
  });

  if (loading) {
    return <div>loading...</div>;
  } else if (!community) {
    return <LandingPageApp />;
  }

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
                <NavBar />
                <Component {...pageProps} />
              </ErrorModalProvider>
            </AuthProvider>
          </ConnectKitProvider>
        </WagmiConfig>
      </ApolloProvider>
    </>
  );
}
