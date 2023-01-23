import { useEffect } from "react";
import { v4 } from "uuid";
import Head from "next/head";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { useLazyQuery } from "@apollo/client";
import { GET_PROPLOT_QUERY } from "@/graphql/queries/propLotQuery";

export default function Home() {
  const { address, isConnecting, isDisconnected } = useAccount();

  const [getPropLotQuery, { data, refetch, error }] = useLazyQuery(
    GET_PROPLOT_QUERY,
    {
      context: {
        clientName: "PropLot",
        headers: {
          "proplot-tz": Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      },
    }
  );

  /*
    Parse the query params from the url on page load and send them as filters in the initial
    PropLot query.
  */
  useEffect(() => {
    const urlParams = window.location.search;
    const currentURLParams = urlParams
      .substring(1)
      .split("&")
      .filter((str) => Boolean(str));

    getPropLotQuery({
      variables: {
        options: {
          requestUUID: v4(),
          filters: currentURLParams,
        },
      },
    });
  }, []);

  console.log(data);

  return (
    <>
      <Head>
        <title>Prop Lot</title>
        <meta name="description" content="Vote on nounish ideas." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* REPLACE! NEED TO FIX TAILWIND BUILD STEP */}
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <main className="max-w-screen-xl mx-auto">
        <section className="flex justify-between pt-8">
          {/* empty span for spacing */}
          <span />
          <h1 className="font-bold text-xl">Prop Lot</h1>
          <ConnectKitButton />
        </section>

        <section>
          {data?.propLot?.ideas?.map((idea: any) => {
            return <div>idea</div>;
          })}
        </section>
      </main>
    </>
  );
}
