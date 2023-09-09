import Router from "next/router";
import { ReactNode, useEffect, useState } from "react";
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
import {
  SUPPORTED_SUBDOMAINS,
  SupportedTokenGetterMap,
} from "@/utils/supportedTokenUtils";
import { getPropLot } from "@/graphql/types/__generated__/getPropLot";
import ButtonFilters from "./ButtonFilters";
import Image from "next/image";
import Link from "next/link";
import { formatEthValue, getEtherBalance } from "@/utils/ethers";

const CommunityDataCard = ({ title, icon, content }: { title: string; icon: ReactNode; content: string; }) => {
  return (
    <div className="grow shrink w-[215px] h-[94px] basis-0 self-stretch p-md bg-white rounded-xl border border-slate/40 justify-start items-start gap-sm flex">
      <div className="grow shrink basis-0 flex-col justify-start gap-md items-start inline-flex">
        <div className="text-slate text-sm font-normal">{title}</div>
        <div className="text-black text-base font-bold">{content}</div>
      </div>
      {icon}
    </div>
  );
};

export default function IdeasHome({
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
  const openIdeas = data?.propLot?.list?.filter((li) => li.__typename === "Idea" && !li.closed)?.length || 0; // todo: add to metadata response

  return (
    <main className="pt-xl min-h-[calc(100vh-72px)] flex flex-col">
      <section className="gap-[72px] flex flex-col">
        <div className="w-full max-w-screen-xl mx-auto px-lg justify-center lg:justify-start items-start gap-lg inline-flex flex-wrap">
          <div className="w-full md:w-1/3 min-w-[320px] justify-center lg:justify-start items-start gap-lg inline-flex">
            <div className="w-[96px] h-[96px] rounded-xl border border-slate">
              <Image
                width="100"
                height="100"
                alt="noggles"
                className="grow shrink basis-0 self-stretch"
                src={community.data.pfpUrl}
              />
            </div>
            <div className="self-stretch flex-col justify-start items-start gap-4 inline-flex">
              <div className="text-base text-xxl font-bold">
                {community.data.name}
              </div>
              <div className="justify-start items-center gap-sm inline-flex">
                <Link href="https://nouns.wtf" target="_blank">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M8 12C8 12.2652 8.10536 12.5196 8.29289 12.7071C8.48043 12.8946 8.73478 13 9 13H15C15.2652 13 15.5196 12.8946 15.7071 12.7071C15.8946 12.5196 16 12.2652 16 12C16 11.7348 15.8946 11.4804 15.7071 11.2929C15.5196 11.1054 15.2652 11 15 11H9C8.73478 11 8.48043 11.1054 8.29289 11.2929C8.10536 11.4804 8 11.7348 8 12ZM10 15H7C6.20435 15 5.44129 14.6839 4.87868 14.1213C4.31607 13.5587 4 12.7956 4 12C4 11.2044 4.31607 10.4413 4.87868 9.87868C5.44129 9.31607 6.20435 9 7 9H10C10.2652 9 10.5196 8.89464 10.7071 8.70711C10.8946 8.51957 11 8.26522 11 8C11 7.73478 10.8946 7.48043 10.7071 7.29289C10.5196 7.10536 10.2652 7 10 7H7C5.67392 7 4.40215 7.52678 3.46447 8.46447C2.52678 9.40215 2 10.6739 2 12C2 13.3261 2.52678 14.5979 3.46447 15.5355C4.40215 16.4732 5.67392 17 7 17H10C10.2652 17 10.5196 16.8946 10.7071 16.7071C10.8946 16.5196 11 16.2652 11 16C11 15.7348 10.8946 15.4804 10.7071 15.2929C10.5196 15.1054 10.2652 15 10 15ZM17 7H14C13.7348 7 13.4804 7.10536 13.2929 7.29289C13.1054 7.48043 13 7.73478 13 8C13 8.26522 13.1054 8.51957 13.2929 8.70711C13.4804 8.89464 13.7348 9 14 9H17C17.7956 9 18.5587 9.31607 19.1213 9.87868C19.6839 10.4413 20 11.2044 20 12C20 12.7956 19.6839 13.5587 19.1213 14.1213C18.5587 14.6839 17.7956 15 17 15H14C13.7348 15 13.4804 15.1054 13.2929 15.2929C13.1054 15.4804 13 15.7348 13 16C13 16.2652 13.1054 16.5196 13.2929 16.7071C13.4804 16.8946 13.7348 17 14 17H17C18.3261 17 19.5979 16.4732 20.5355 15.5355C21.4732 14.5979 22 13.3261 22 12C22 10.6739 21.4732 9.40215 20.5355 8.46447C19.5979 7.52678 18.3261 7 17 7Z"
                      fill="#68778D"
                    />
                  </svg>
                </Link>

                <Link href="https://nouns.wtf" target="_blank">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M21.4092 8.64C21.4092 8.64 21.4092 8.64 21.4092 8.59C20.7046 6.66623 19.4261 5.00529 17.7467 3.83187C16.0673 2.65845 14.068 2.02917 12.0192 2.02917C9.97047 2.02917 7.97115 2.65845 6.29173 3.83187C4.6123 5.00529 3.33382 6.66623 2.62922 8.59C2.62922 8.59 2.62922 8.59 2.62922 8.64C1.84234 10.8109 1.84234 13.1891 2.62922 15.36C2.62922 15.36 2.62922 15.36 2.62922 15.41C3.33382 17.3338 4.6123 18.9947 6.29173 20.1681C7.97115 21.3416 9.97047 21.9708 12.0192 21.9708C14.068 21.9708 16.0673 21.3416 17.7467 20.1681C19.4261 18.9947 20.7046 17.3338 21.4092 15.41C21.4092 15.41 21.4092 15.41 21.4092 15.36C22.1961 13.1891 22.1961 10.8109 21.4092 8.64ZM4.25922 14C3.91245 12.6892 3.91245 11.3108 4.25922 10H6.11922C5.95925 11.3285 5.95925 12.6715 6.11922 14H4.25922ZM5.07922 16H6.47922C6.71394 16.8918 7.04943 17.7541 7.47922 18.57C6.49852 17.9019 5.67872 17.0241 5.07922 16ZM6.47922 8H5.07922C5.67009 6.97909 6.47941 6.10147 7.44922 5.43C7.02977 6.24725 6.70436 7.10942 6.47922 8ZM10.9992 19.7C9.77098 18.7987 8.90837 17.4852 8.56922 16H10.9992V19.7ZM10.9992 14H8.13922C7.95261 12.6732 7.95261 11.3268 8.13922 10H10.9992V14ZM10.9992 8H8.56922C8.90837 6.51477 9.77098 5.20132 10.9992 4.3V8ZM18.9192 8H17.5192C17.2845 7.10816 16.949 6.24594 16.5192 5.43C17.4999 6.09807 18.3197 6.97594 18.9192 8ZM12.9992 4.3C14.2275 5.20132 15.0901 6.51477 15.4292 8H12.9992V4.3ZM12.9992 19.7V16H15.4292C15.0901 17.4852 14.2275 18.7987 12.9992 19.7ZM15.8592 14H12.9992V10H15.8592C16.0458 11.3268 16.0458 12.6732 15.8592 14ZM16.5492 18.57C16.979 17.7541 17.3145 16.8918 17.5492 16H18.9492C18.3497 17.0241 17.5299 17.9019 16.5492 18.57ZM19.7392 14H17.8792C17.9605 13.3365 18.0006 12.6685 17.9992 12C18.0003 11.3315 17.9602 10.6636 17.8792 10H19.7392C20.086 11.3108 20.086 12.6892 19.7392 14Z"
                      fill="#68778D"
                    />
                  </svg>
                </Link>

                <Link href="https://x.com/nounsdao" target="_blank">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M22 5.79997C21.2483 6.12606 20.4534 6.34163 19.64 6.43997C20.4982 5.92729 21.1413 5.12075 21.45 4.16997C20.6436 4.65003 19.7608 4.98826 18.84 5.16997C18.2245 4.50254 17.405 4.05826 16.5098 3.90682C15.6147 3.75537 14.6945 3.90532 13.8938 4.33315C13.093 4.76099 12.4569 5.4425 12.0852 6.2708C11.7135 7.09911 11.6273 8.02736 11.84 8.90997C10.2094 8.82749 8.61444 8.40292 7.15865 7.66383C5.70287 6.92474 4.41885 5.88766 3.39 4.61997C3.02914 5.25013 2.83952 5.96379 2.84 6.68997C2.83872 7.36435 3.00422 8.02858 3.32176 8.62353C3.63929 9.21848 4.09902 9.72568 4.66 10.1C4.00798 10.0822 3.36989 9.90726 2.8 9.58997V9.63997C2.80489 10.5849 3.13599 11.4991 3.73731 12.2279C4.33864 12.9568 5.17326 13.4556 6.1 13.64C5.74326 13.7485 5.37287 13.8058 5 13.81C4.74189 13.807 4.48442 13.7835 4.23 13.74C4.49391 14.5528 5.00462 15.2631 5.69107 15.7721C6.37753 16.2811 7.20558 16.5635 8.06 16.58C6.6172 17.7152 4.83588 18.3348 3 18.34C2.66574 18.3411 2.33174 18.321 2 18.28C3.87443 19.4902 6.05881 20.1327 8.29 20.13C9.82969 20.146 11.3571 19.855 12.7831 19.274C14.2091 18.6931 15.505 17.8338 16.5952 16.7465C17.6854 15.6591 18.548 14.3654 19.1326 12.9409C19.7172 11.5164 20.012 9.98969 20 8.44997C20 8.27996 20 8.09997 20 7.91997C20.7847 7.33478 21.4615 6.61739 22 5.79997Z"
                      fill="#68778D"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          <CommunityDataCards community={community} openIdeas={openIdeas} />
        </div>

        <div className="border-t border-b border-grey items-normal sm:items-center">
          <div className="max-w-screen-xl mx-auto w-full flex flex-row gap-lg p-lg items-normal justify-between sm:items-center">
            <div className="flex flex-row gap-sm">
              <div className="flex flex-col-reverse gap-lg sm:flex-row justify-between items-end sm:items-center">
                {data?.propLot?.listFilter && (
                  <ButtonFilters
                    filter={data.propLot.listFilter}
                    updateFilters={handleUpdateFilters}
                  />
                )}
              </div>
            </div>

            <div className="flex flex-row gap-sm">
              <div className="flex flex-col-reverse sm:flex-row justify-between items-end sm:items-center">
                <button
                  className={`${
                    nounBalance === 0
                      ? "!bg-white !text-light-green"
                      : "!bg-grey/20 !text-grey"
                  } !border-grey border-[1px] !text-sm !rounded-[10px] !font-inter !font-bold !pt-sm !pb-sm !pl-md !pr-md self-center`}
                  onClick={() => {
                    if (nounBalance > 0) {
                      Router.push("/ideas/new");
                    }
                  }}
                >
                  New Submission
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-screen-xl mx-auto mt-lg gap-lg flex flex-col px-lg w-full">
        <div className="flex flex-col w-full sm:flex-row justify-between gap-lg items-normal sm:items-center">
          <div className="flex flex-row text-black text-lg font-bold">
            All Ideas
          </div>
          <div className="flex flex-row gap-sm">
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
        </div>
        {appliedFilterTags?.length > 0 && (
          <div className="flex flex-row items-center gap-sm overflow-x-scroll scrollbar-hide">
            {appliedFilterTags.map((filterTag) => {
              return (
                <button
                  key={filterTag.displayName}
                  className="text-white bg-black text-sm font-bold rounded-[8px] px-sm py-xs flex items-center whitespace-nowrap"
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
                      className="w-[20px] h-[20px] flex pl-[4px] font-bold"
                    >
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </span>
                </button>
              );
            })}
          </div>
        )}
        <div className="gap-lg flex flex-row flex-wrap items-center w-full overflow-scroll">
          {data?.propLot?.list?.map((listItem: any, idx: number) => {
            if (listItem.__typename === "Idea") {
              return (
                <IdeaRow
                  key={`idea-${idx}`}
                  idea={listItem}
                  nounBalance={nounBalance}
                  refetch={() => {
                    handleRefresh();
                  }}
                />
              );
            }

            return null;
          })}
          {data?.propLot?.list?.length === 0 && (
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

function CommunityDataCards({
  community,
  openIdeas,
}: {
  community: Community & { data: { name: string; pfpUrl: string } };
  openIdeas: number;
}) {
  const [liveData, setLiveData] = useState<any>({});
  useEffect(() => {
    async function getBalance() {
      const supportedTokenConfig =
        SupportedTokenGetterMap[community?.uname as SUPPORTED_SUBDOMAINS];
      let balance = 0;
      try {
        balance = (
          await getEtherBalance(supportedTokenConfig.account)
        ).toNumber();
      } catch (e) {
        console.log(e);
      }

      setLiveData((l: any) => ({
        ...l,
        balance: balance,
      }));
    }

    getBalance();
  }, []);

  useEffect(() => {
    async function getGovernance() {
      const supportedTokenConfig =
        SupportedTokenGetterMap[community?.uname as SUPPORTED_SUBDOMAINS];
      try {
        const governance = await supportedTokenConfig.getGovernanceData();
        setLiveData((l: any) => ({
          ...l,
          governance: governance,
        }));
      } catch (e) {
        console.log(e);
      }
    }

    getGovernance();
  }, []);

  return (
    <div className="flex flex-1 flex-wrap md:!flex-nowrap gap-lg  justify-end">
      <CommunityDataCard
        title={"Voters / Tokens"}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M4.00039 15V12.3314M9.33372 15V12.3314M14.6671 15V12.3314M20.0004 15V12.3314M2.40039 18.4H21.6004V21.6H2.40039V18.4ZM2.40039 8.80002V6.66669L11.6059 2.40002L21.6004 6.66669V8.80002H2.40039Z"
              stroke="#68778D"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        }
        content={`${liveData?.governance?.currentTokenHolders || 0} / ${liveData?.governance?.delegatedVotes || 0}`}
      />
      <CommunityDataCard
        title={"Treasury"}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M10.1994 3.97685C11.4032 2.99134 12.9421 2.40002 14.6192 2.40002C18.4752 2.40002 21.601 5.52589 21.601 9.38184C21.601 11.0582 21.0103 12.5965 20.0256 13.8M16.363 14.6182C16.363 18.4742 13.2372 21.6 9.38123 21.6C5.52528 21.6 2.39941 18.4742 2.39941 14.6182C2.39941 10.7623 5.52528 7.63639 9.38123 7.63639C13.2372 7.63639 16.363 10.7623 16.363 14.6182Z"
              stroke="#68778D"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        }
        content={`Ξ ${formatEthValue(liveData?.balance || 0)}`}
      />
      <CommunityDataCard
        title={"Open Ideas"}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M5.28881 13.6315L12.278 2.64854C12.5465 2.22652 13.1998 2.41675 13.1998 2.91698V10.7C13.1998 10.7552 13.2446 10.8 13.2998 10.8H18.2395C18.644 10.8 18.8811 11.2553 18.6491 11.5867L11.7094 21.5005C11.4291 21.901 10.7998 21.7026 10.7998 21.2138V14.5C10.7998 14.4447 10.755 14.4 10.6998 14.4H5.71064C5.3161 14.4 5.07699 13.9644 5.28881 13.6315Z"
              stroke="#68778D"
              stroke-width="1.5"
            />
          </svg>
        }
        content={`${openIdeas}`}
      />
    </div>
  );
}
