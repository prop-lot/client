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
import { Community } from "@prisma/client";
import { SUPPORTED_SUBDOMAINS } from "@/utils/supportedTokenUtils";
import { getPropLot } from "@/graphql/types/__generated__/getPropLot";

export default function CommunityHome({
  community,
}: {
  community: Community & { data: { name: string; pfpUrl: string } };
}) {
  const { address } = useAccount();

  const [getPropLotQuery, { data, refetch, error }] = useLazyQuery<getPropLot>(
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
        clientName: community?.uname as SUPPORTED_SUBDOMAINS,
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
  const appliedFilterTags = data?.propLot?.appliedFilterTags || [];

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
        <div className="mt-12 mb-4 flex flex-row space-x-4 items-center">
          <img src={community.data.pfpUrl} className="w-52 h-52 rounded-lg" />
          <h3 className="text-3xl font-bold">
            {community?.data?.name} PropLot
          </h3>
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
            } !border-none !text-[16px] !rounded-[10px] !font-propLot !font-bold !pt-[8px] !pb-[8px] !pl-[16px] !pr-[16px] mb-4 sm:!mb-0`}
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
        {appliedFilterTags?.length > 0 && (
          <div className="max-w-screen-xl mx-auto pt-8 space-y-4">
            <div className="flex flex-row items-center gap-[8px] overflow-scroll">
              {appliedFilterTags.map((filterTag) => {
                return (
                  <button
                    key={filterTag.displayName}
                    className="text-white bg-black text-sm font-bold rounded-[8px] px-[8px] py-[4px] flex items-center whitespace-nowrap"
                    onClick={() => {
                      refetch({
                        options: {
                          requestUUID: v4(),
                          filters: appliedFilters.filter((f) => {
                            return f !== filterTag.param;
                          }),
                        },
                      });
                    }}
                  >
                    <span className="flex">{filterTag.displayName}</span>
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5 flex pl-[4px] font-bold"
                      >
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="max-w-screen-xl mx-auto pt-8 space-y-4">
          {data?.propLot?.ideas?.map((idea: any, idx: number) => {
            return (
              <IdeaRow
                communityName={community.data.name}
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
