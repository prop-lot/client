import { useEffect } from "react";
import Image from "next/image";
import { v4 } from "uuid";
import Head from "next/head";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { useLazyQuery } from "@apollo/client";
import { GET_PROPLOT_QUERY } from "@/graphql/queries/propLotQuery";
import IdeaRow from "@/components/IdeaRow";
import UIFilter from "@/components/UIFilter";

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
    Filters that are applied to the current response.
    These can be parsed to update the local state after each request to ensure the client + API are in sync.
  */
  const appliedFilters = data?.propLot?.metadata?.appliedFilters || [];

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

  const handleRefresh = () => {
    refetch({ options: { requestUUID: v4(), filters: appliedFilters } });
  };

  const handleUpdateFilters = (updatedFilters: string[], filterId: string) => {
    /*
      Keep previously applied filters, remove any that match the filterId value.
      Then add the selection of updatedFilters and remove the __typename property.
    */
    const selectedfilters: string[] = [
      ...appliedFilters.filter((f: string) => {
        return !f.includes(`${filterId}=`);
      }),
      ...updatedFilters,
    ];

    refetch({ options: { requestUUID: v4(), filters: selectedfilters } });
  };

  const nounBalance = 5; // todo: replace

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
      <main className="pt-8">
        <section className=" max-w-screen-xl mx-auto">
          <nav className="flex justify-between">
            <Image
              src="/logo.svg"
              alt="PropLot logo, which is a car noun with text spelling prop lot."
              width="140"
              height="120"
            />
            <ConnectKitButton />
          </nav>
          <div className="my-12 flex flex-row space-x-4 items-center">
            <span className="w-52 h-52 border bg-gray-200 block rounded-lg"></span>
            <h3 className="text-3xl font-bold">Nouns PropLot</h3>
          </div>
          <div className="flex justify-between mb-4 items-center">
            <div className="flex flex-row space-x-4">
              {data?.propLot?.sortFilter && (
                <UIFilter
                  filter={data.propLot.sortFilter}
                  updateFilters={handleUpdateFilters}
                />
              )}
              {data?.propLot?.tagFilter && (
                <UIFilter
                  filter={data.propLot.tagFilter}
                  updateFilters={handleUpdateFilters}
                />
              )}
              {data?.propLot?.dateFilter && (
                <UIFilter
                  filter={data.propLot.dateFilter}
                  updateFilters={handleUpdateFilters}
                />
              )}
            </div>
            <button className="bg-gray-700 text-white rounded-lg px-3 py-2">
              New Submission
            </button>
          </div>
        </section>

        <section className="border-t bg-gray-100 pb-8">
          <div className="max-w-screen-xl mx-auto pt-8 space-y-4">
            {data?.propLot?.ideas?.map((idea: any, idx: number) => {
              return (
                <IdeaRow
                  key={`idea-${idx}`}
                  idea={idea}
                  nounBalance={nounBalance}
                  refetch={() => {
                    handleRefresh();
                  }}
                />
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
