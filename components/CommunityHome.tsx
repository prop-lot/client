import Router from "next/router";
import { useEffect } from "react";
import { v4 } from "uuid";
import { useAccount } from "wagmi";
import { useLazyQuery } from "@apollo/client";
import { GET_PROPLOT_QUERY } from "@/graphql/queries/propLotQuery";
import { DELEGATED_VOTES_BY_OWNER_SUB } from "@/graphql/subgraph";
import IdeaRow from "@/components/IdeaRow";
import UIFilter from "@/components/UIFilter";
import useSyncURLParams from "@/hooks/useSyncURLParams";
import EmptyState from "@/components/EmptyState";

export default function CommunityHome() {
  const { address } = useAccount();

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

  const [getDelegatedVotes, { data: getDelegatedVotesData }] = useLazyQuery(
    DELEGATED_VOTES_BY_OWNER_SUB,
    {
      context: {
        clientName: "LilNouns", // change to 'NounsDAO' to query the nouns subgraph
      },
    }
  );

  useEffect(() => {
    if (address) {
      getDelegatedVotes({
        variables: {
          id: address.toLowerCase(),
        },
      });
    }
  }, [address, getDelegatedVotes]);

  /*
    Filters that are applied to the current response.
    These can be parsed to update the local state after each request to ensure the client + API are in sync.
  */
  const appliedFilters = data?.propLot?.metadata?.appliedFilters || [];

  useSyncURLParams(appliedFilters, data?.propLot?.metadata?.requestUUID);

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
  }, [getPropLotQuery]);

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

  const nounBalance = getDelegatedVotesData?.delegate?.delegatedVotes || 0; // todo: replace

  return (
    <main className="pt-8">
      <section className="max-w-screen-xl mx-auto px-[20px] xl:px-0">
        <div className="my-12 flex flex-row space-x-4 items-center">
          <span className="w-52 h-52 border bg-gray-200 block rounded-lg"></span>
          <h3 className="text-3xl font-bold">Nouns PropLot</h3>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-between mb-4 items-start sm:items-center">
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
          <button
            className={`${
              nounBalance > 0
                ? "!bg-[#2B83F6] !text-white"
                : "!bg-[#F4F4F8] !text-[#E2E3E8]"
            } !border-none !text-[16px] !rounded-[10px] !font-propLot !font-bold !pt-[8px] !pb-[8px] !pl-[16px] !pr-[16px] mb-[8px] sm:mb-0`}
            onClick={() => {
              if (nounBalance > 0) {
                Router.push("/idea/new");
              }
            }}
          >
            New Submission
          </button>
        </div>
      </section>

      <section className="border-t bg-gray-100 pb-8 px-[20px] xl:px-0">
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
          {data?.propLot?.ideas?.length === 0 && (
            <EmptyState
              appliedFilters={appliedFilters}
              error={error}
              clearFilters={() => {
                refetch({ options: { requestUUID: v4(), filters: [] } });
              }}
            />
          )}
        </div>
      </section>
    </main>
  );
}
