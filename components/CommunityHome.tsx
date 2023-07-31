import Router from "next/router";
import Image from "next/image";
import { useEffect } from "react";
import { v4 } from "uuid";
import { useAccount } from "wagmi";
import { useLazyQuery } from "@apollo/client";
import { GET_PROPLOT_QUERY } from "@/graphql/queries/propLotQuery";
import { DELEGATED_VOTES_BY_OWNER_SUB } from "@/graphql/subgraph";
import IdeaRow from "@/components/IdeaRow";
import EmptyState from "@/components/EmptyState";
import FAQAccordion from "@/components/FAQAccordion"
import { Community } from "@prisma/client";
import { SUPPORTED_SUBDOMAINS } from "@/utils/supportedTokenUtils";
import { getPropLot } from "@/graphql/types/__generated__/getPropLot";

const PROPLOT_HOME_FILTER = "PROPLOT_HOME";

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

  useEffect(() => {
    getPropLotQuery({
      variables: {
        options: {
          requestUUID: v4(),
          filters: [PROPLOT_HOME_FILTER],
        },
      },
    });
  }, [getPropLotQuery]);

  const handleRefresh = () => {
    refetch({ options: { requestUUID: v4(), filters: [PROPLOT_HOME_FILTER] } });
  };

  const nounBalance = getDelegatedVotesData?.delegate?.delegatedVotes || 0;

  return (
    <main className="pt-8 min-h-[calc(100vh-72px)] flex flex-col">
      <section className="!font-ptRootUI max-w-screen-xl mx-auto px-[20px] xl:px-0 py-[72px] gap-8 flex flex-col md:flex-row md:justify-start">
        <div className="flex flex-col items-center text-center gap-8 md:text-left">
          <div className="flex flex-col gap-3">
            <div className="text-indigo-600 text-[18px] font-medium">
              Find ideas and propose to
            </div>
            <div className="text-black text-[60px] font-bold">
              Build with Nouns
            </div>
            <div className="text-gray-500 text-[18px]">
              Prop Lot is the easiest way to find things Nouns want to fund and
              build them! Simply find an idea you like and propose a build.
              Nouns voters will vote to fund your build.
            </div>
          </div>
          <div className="flex flex-col gap-8">
            <div className="border-t border-gray-200"></div>
            <div className="flex flex-col gap-2">
              <div className="gap-2">
                <div>
                  <span className="text-black text-base font-medium leading-normal">
                    Are you a creator or vendor? &nbsp;
                  </span>
                  <a
                    className="text-[#2B83F6] cursor-pointer inline-flex gap-2"
                    href={`/ideas`}
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
                    href={`/ideas`}
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
        <div className="flex flex-col items-center md:items-start gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="w-20 h-14 relative">
              <Image src="/bag.svg" alt="Bag image." width="75" height="54" />
            </div>
            <div className="flex flex-col gap-2 items-center md:items-start">
              <div className="text-black text-[24px] font-bold">
                $60M treasury
              </div>
              <div className="text-gray-500 text-[18px]">
                Community governed treasury to fund Nounish ideas
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 items-center md:items-start">
            <div className="w-10 h-14 relative">
              <Image
                src="/pencil.svg"
                alt="Pencil image."
                width="75"
                height="54"
              />
            </div>
            <div className="flex flex-col gap-2 items-center md:items-start">
              <div className="text-black text-[24px] font-bold">CC0 brand</div>
              <div className="text-gray-500 text-[18px]">
                Use the Noun brand however, whenever you like
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center md:items-start gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="w-14 h-14 relative">
              <Image
                src="/gameboy.svg"
                alt="Gameboy image."
                width="75"
                height="54"
              />
            </div>
            <div className="flex flex-col gap-2 items-center md:items-start">
              <div className="text-black text-[24px] font-bold">
                Fund anything cool
              </div>
              <div className="text-gray-500 text-[18px]">
                Community governed treasury to fund Nounish ideas
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="w-20 h-14 relative">
              <Image src="/sun.svg" alt="Sun image." width="75" height="54" />
            </div>
            <div className="flex flex-col items-start gap-2">
              <div className="text-black text-[24px] font-bold">
                Build any idea
              </div>
              <div className="text-gray-500 text-[18px]">
                Use the Noun brand however, whenever you like
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="!font-ptRootUI max-w-screen-xl mx-auto mb-[20px] px-[20px] py-[72px] xl:px-0">
        <div className="flex-col justify-start items-center gap-3 flex">
          <div className="text-indigo-600 text-lg font-medium">
            Browse ideas
          </div>
          <div className="text-black text-6xl font-bold">Latest ideas</div>
          <div className="justify-center items-center gap-2 inline-flex flex-wrap">
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

      <section className="pb-8 px-[20px] xl:px-0 grow">
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
              appliedFilters={[]}
              error={error}
              clearFilters={() => {
                refetch({ options: { requestUUID: v4(), filters: [] } });
              }}
            />
          )}
        </div>
        <div className="flex flex-col-reverse sm:flex-row items-center justify-center mt-4">
          <button
            className="!bg-[#34AC80] !text-[#FFF] !border-none !text-[16px] !rounded-[10px] !font-ptRootUI !font-bold !pt-[8px] !pb-[8px] !pl-[24px] !pr-[24px] self-center"
            onClick={() => {
              Router.push("/ideas");
            }}
          >
            Browse all ideas
          </button>
        </div>
      </section>

      <section className="!font-ptRootUI flex flex-1 justify-center px-[20px] xl:px-0 py-[72px] gap-8">
        <FAQAccordion />
      </section>
    </main>
  );
}
