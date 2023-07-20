import Router from "next/router";
import Image from "next/image";
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
    <main className="pt-8 min-h-[calc(100vh-72px)] flex flex-col">
      <div>
        <section className="!font-ptRootUI max-w-screen-xl mx-auto px-[20px] xl:px-0">
          <div className="py-16 flex-col flex">
            <div className="flex flex-col gap-8 justify-center items-center text-center md:flex-row md:justify-start md:gap-24 md:inline-flex md:!text-start">
              <div className="flex-col gap-8 inline-flex">
                <div className="flex-col gap-3 flex">
                  <div className="text-indigo-600 text-[18px] font-medium">
                    Find ideas and propose to
                  </div>
                  <div className="text-black text-[60px]">Build with Nouns</div>
                  <div className="self-stretch text-gray-500 text-[18px] font-normal">
                    Prop Lot is the easiest way to find things Nouns want to
                    fund and build them! Simply find an idea you like and
                    propose a build. Nouns voters will vote to fund your build.
                  </div>
                </div>
                <div className="flex-col gap-8 flex">
                  <div className="self-stretch h-px border border-gray-200"></div>
                  <div className="flex-col gap-2 flex">
                    <div className="gap-2">
                      <div>
                        <span className="text-black text-base font-medium leading-normal">
                          Are you a creator or vendor? &nbsp;
                        </span>
                        <a
                          className="text-[#2B83F6] cursor-pointer inline-flex gap-2"
                          href={`/idea`}
                        >
                          <span className="text-indigo-600 text-base font-medium leading-normal">
                            Find ideas to build
                          </span>
                          <Image
                            src="/arrow-right.svg"
                            alt="arrow-right icon."
                            width="16"
                            height="16"
                          />
                        </a>
                      </div>
                    </div>
                    <div className="gap-2">
                      <div>
                        <span className="text-black text-base font-medium leading-normal">
                          Are you a Nouns voter? &nbsp;
                        </span>
                        <a
                          className="text-[#2B83F6] cursor-pointer inline-flex gap-2"
                          href={`/idea`}
                        >
                          <span className="text-indigo-600 text-base font-medium leading-normal">
                            Submit and vote on ideas
                          </span>
                          <Image
                            src="/arrow-right.svg"
                            alt="arrow-right icon."
                            width="16"
                            height="16"
                          />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-col justify-start items-start gap-8 inline-flex">
                <div className="self-stretch justify-start items-start gap-8 inline-flex">
                  <div className="grow shrink basis-0 flex-col justify-center items-center md:justify-start md:items-start gap-4 inline-flex">
                    <div className="w-20 h-14 relative">
                      <Image
                        src="/bag.svg"
                        alt="Bag image."
                        width="75"
                        height="54"
                      />
                    </div>
                    <div className="self-stretch flex-col justify-start items-start gap-2 flex">
                      <div className="self-stretch text-black text-[24px] font-bold">
                        $60M treasury
                      </div>
                      <div className="self-stretch text-gray-500 text-[18px] font-normal">
                        Community governed treasury to fund Nounish ideas
                      </div>
                    </div>
                  </div>
                  <div className="grow shrink basis-0 flex-col justify-center items-center md:justify-start md:items-start gap-4 inline-flex">
                    <div className="w-10 h-14 relative">
                      <Image
                        src="/pencil.svg"
                        alt="Pencil image."
                        width="75"
                        height="54"
                      />
                    </div>
                    <div className="self-stretch flex-col justify-start items-start gap-2 flex">
                      <div className="self-stretch text-black text-[24px] font-bold">
                        CC0 brand
                      </div>
                      <div className="self-stretch text-gray-500 text-[18px] font-normal">
                        Use the Noun brand however, whenever you like
                      </div>
                    </div>
                  </div>
                </div>
                <div className="self-stretch justify-start items-start gap-8 inline-flex">
                  <div className="grow shrink basis-0 flex-col justify-center items-center md:justify-start md:items-start gap-4 inline-flex">
                    <div className="w-14 h-14 relative">
                      <Image
                        src="/gameboy.svg"
                        alt="Gameboy image."
                        width="75"
                        height="54"
                      />
                    </div>
                    <div className="self-stretch flex-col justify-start items-start gap-2 flex">
                      <div className="self-stretch text-black text-[24px] font-bold">
                        Fund anything cool
                      </div>
                      <div className="self-stretch text-gray-500 text-[18px] font-normal">
                        Community governed treasury to fund Nounish ideas
                      </div>
                    </div>
                  </div>
                  <div className="grow shrink basis-0 flex-col justify-center items-center md:justify-start md:items-start gap-4 inline-flex">
                    <div className="w-20 h-14 relative">
                      <Image
                        src="/sun.svg"
                        alt="Sun image."
                        width="75"
                        height="54"
                      />
                    </div>
                    <div className="self-stretch flex-col justify-start items-start gap-2 flex">
                      <div className="self-stretch text-black text-[24px] font-bold">
                        Build any idea
                      </div>
                      <div className="self-stretch text-gray-500 text-[18px] font-normal">
                        Use the Noun brand however, whenever you like
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="!font-ptRootUI max-w-screen-xl mx-auto mb-[20px] px-[20px] xl:px-0">
        <div className="flex-col justify-start items-center gap-3 flex">
          <div className="text-indigo-600 text-lg font-medium">
            Browse ideas
          </div>
          <div className="text-black text-6xl font-bold">Latest ideas</div>
          <div className="justify-start items-start gap-4 inline-flex">
            <div className="px-4 py-2 bg-indigo-600 bg-opacity-10 rounded-[10px] justify-center items-center gap-1 flex">
              <div className="text-indigo-600 text-base font-bold leading-normal">
                Art
              </div>
            </div>
            <div className="px-4 py-2 bg-pink-400 bg-opacity-10 rounded-[10px] justify-center items-center gap-1 flex">
              <div className="text-pink-400 text-base font-bold leading-normal">
                Public Goods
              </div>
            </div>
            <div className="px-4 py-2 bg-orange-600 bg-opacity-10 rounded-[10px] justify-center items-center gap-1 flex">
              <div className="text-orange-600 text-base font-bold leading-normal">
                Events
              </div>
            </div>
            <div className="px-4 py-2 bg-green-700 bg-opacity-10 rounded-[10px] justify-center items-center gap-1 flex">
              <div className="text-green-700 text-base font-bold leading-normal">
                DAO toos
              </div>
            </div>
            <div className="px-4 py-2 bg-fuchsia-500 bg-opacity-10 rounded-[10px] justify-center items-center gap-1 flex">
              <div className="text-fuchsia-500 text-base font-bold leading-normal">
                Media
              </div>
            </div>
            <div className="px-4 py-2 bg-sky-400 bg-opacity-10 rounded-[10px] justify-center items-center gap-1 flex">
              <div className="text-sky-400 text-base font-bold leading-normal">
                Memeing
              </div>
            </div>
            <div className="px-4 py-2 bg-amber-400 bg-opacity-10 rounded-[10px] justify-center items-center gap-1 flex">
              <div className="text-amber-400 text-base font-bold leading-normal">
                Community
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-gray-100 pb-8 px-[20px] xl:px-0 grow">
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
