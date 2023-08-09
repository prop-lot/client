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
import FAQAccordion from "@/components/FAQAccordion";
import { Community } from "@prisma/client";
import { SUPPORTED_SUBDOMAINS } from "@/utils/supportedTokenUtils";
import { getPropLot } from "@/graphql/types/__generated__/getPropLot";
import Link from "next/link";

const PROPLOT_HOME_FILTER = "PROPLOT_HOME";

const LandingPageHeading = ({ title, svgs }) => {
  return (
    <div
      style={{
        position: "relative",
        backgroundImage: "url(/background-image.svg)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="flex flex-col justify-center align-center w-full pt-[0%] pb-[0%] md:pt-[7%] md:pb-[7%]"
    >
      <div className="flex flex-col justify-center items-center mx-auto align-center h-full w-[55%] max-w-[522px] min-w-[300px]">
        <h1
          style={{ textAlign: "center", position: "relative" }}
          className="text-center font-londrinaLight text-black text-xxl md:text-[69px] lg:text-[89px] font-light"
        >
          {title}
        </h1>

        <p
          style={{ textAlign: "center", position: "relative" }}
          className="text-md mt-sm text-slate"
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore Lorem ipsum dolor sit amet,
          consectetur
        </p>
      </div>
      <style>{`
        @keyframes flow {
          to { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

// TODO: Replace buttons with tags from API with counts of ideas
const TagButtons = () => (
  <div className="grid grid-cols-3 gap-lg px-lg lg:flex lg:flex-row lg:flex-wrap lg:justify-center">
    <Link
      href="/ideas?tag=ARTISTIC"
      className="bg-white rounded-xl border p-md gap-sm border-grey justify-start items-center flex flex-col md:flex-row"
    >
      <div className="w-[36px] h-[36px] bg-blue/20 rounded-full flex-col justify-center items-center inline-flex">
        <Image src="/brush.svg" alt="brush icon." width="18" height="18" />
      </div>
      <div className="flex-col justify-center items-center md:justify-start md:items-start inline-flex whitespace-nowrap">
        <div className="text-black text-sm md:text-base font-bold">
          Artistic
        </div>
        <div className="text-slate text-sm font-normal">78 ideas</div>
      </div>
    </Link>
    <Link
      href="/ideas?tag=COMMUNITY"
      className="bg-white rounded-xl border p-md gap-sm border-grey justify-start items-center flex flex-col md:flex-row"
    >
      <div className="w-[36px] h-[36px] bg-pink/20 rounded-full flex-col justify-center items-center inline-flex">
        <Image src="/heart.svg" alt="heart icon." width="18" height="18" />
      </div>
      <div className="flex-col justify-center items-center md:justify-start md:items-start inline-flex whitespace-nowrap">
        <div className="text-black text-sm md:text-base font-bold">
          Community
        </div>
        <div className="text-slate text-sm font-normal">78 ideas</div>
      </div>
    </Link>
    <Link
      href="/ideas?tag=GOVERNANCE"
      className="bg-white rounded-xl border p-md gap-sm border-grey justify-start items-center flex flex-col md:flex-row"
    >
      <div className="w-[36px] h-[36px] bg-yellow/20 rounded-full flex-col justify-center items-center inline-flex">
        <Image
          src="/ticket-alt.svg"
          alt="ticket-alt icon."
          width="18"
          height="18"
        />
      </div>
      <div className="flex-col justify-center items-center md:justify-start md:items-start inline-flex whitespace-nowrap">
        <div className="text-black text-sm md:text-base font-bold">
          Governance
        </div>
        <div className="text-slate text-sm font-normal">78 ideas</div>
      </div>
    </Link>
    <Link
      href="/ideas?tag=TECHNICAL"
      className="bg-white rounded-xl border p-md gap-sm border-grey justify-start items-center flex flex-col md:flex-row"
    >
      <div className="w-[36px] h-[36px] bg-green/20 rounded-full flex-col justify-center items-center inline-flex">
        <Image src="/code.svg" alt="code icon." width="18" height="18" />
      </div>
      <div className="flex-col justify-center items-center md:justify-start md:items-start inline-flex whitespace-nowrap">
        <div className="text-black text-sm md:text-base font-bold">
          Technical
        </div>
        <div className="text-slate text-sm font-normal">78 ideas</div>
      </div>
    </Link>
    <Link
      href="/ideas?tag=QUESTION"
      className="bg-white rounded-xl border p-md gap-sm border-grey justify-start items-center flex flex-col md:flex-row"
    >
      <div className="w-[36px] h-[36px] bg-purple/20 rounded-full flex-col justify-center items-center inline-flex">
        <Image
          src="/question.svg"
          alt="question icon."
          width="18"
          height="18"
        />
      </div>
      <div className="flex-col justify-center items-center md:justify-start md:items-start inline-flex whitespace-nowrap">
        <div className="text-black text-sm md:text-base font-bold">Other</div>
        <div className="text-slate text-sm font-normal">78 ideas</div>
      </div>
    </Link>
    <Link
      href="/ideas"
      className="bg-white rounded-xl border p-md gap-sm border-grey justify-start items-center flex flex-col md:flex-row"
    >
      <div className="flex-col justify-center items-center md:justify-start md:items-start inline-flex whitespace-nowrap">
        <div className="text-black text-sm md:text-base font-bold">
          All ideas
        </div>
        <div className="text-slate text-sm font-normal">134 ideas</div>
      </div>
      <div className="w-[36px] h-[36px] rounded-full flex-col justify-center items-center inline-flex">
        <Image
          src="/arrow-right.svg"
          alt="arrow-right icon."
          width="18"
          height="18"
        />
      </div>
    </Link>
  </div>
);

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
    <main className="pt-xl gap-xl min-h-[calc(100vh-72px)] flex flex-col overflow-x-hidden">
      {/* <section className="py-[72px] gap-8 flex flex-row justify-center">
        <div className="flex">
          <div className="left-[0px] top-[130px] relative">
            <Image
              src="/heart.svg"
              alt="heart icon."
              width="100"
              height="100"
            />
          </div>
          <div className="left-[52px] top-[33px] relative">
            <Image
              src="/heart.svg"
              alt="heart icon."
              width="100"
              height="100"
            />
          </div>
          <div className="left-[103px] top-[306px] relative">
            <Image
              src="/heart.svg"
              alt="heart icon."
              width="100"
              height="100"
            />
          </div>
          <div className="left-[10px] top-[277px] relative">
            <Image
              src="/heart.svg"
              alt="heart icon."
              width="100"
              height="100"
            />
          </div>
          <div className="left-[300px] top-[167px] relative">
            {" "}
            <Image
              src="/heart.svg"
              alt="heart icon."
              width="100"
              height="100"
            />
          </div>
          <div className="left-[66px] top-[34px] relative">
            {" "}
            <Image
              src="/heart.svg"
              alt="heart icon."
              width="100"
              height="100"
            />
          </div>
          <div className="left-[-50px] top-[200px] relative">
            {" "}
            <Image
              src="/heart.svg"
              alt="heart icon."
              width="100"
              height="100"
            />
          </div>
          <div className="w-24 h-24 left-0 top-[159px] relative">
            {" "}
            <Image
              src="/heart.svg"
              alt="heart icon."
              width="100"
              height="100"
            />
          </div>
        </div>
        <div className="z-50">
          <h1 className="text-center font-londrina text-black text-[89px] w-[522px] font-light">
            Find ideas to build for Nouns
          </h1>

          <p className="text-md mt-sm text-slate w-[522px]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore Lorem ipsum dolor sit amet,
            consectetur
          </p>
        </div>
        <div className="flex">
          <div className="left-[407px] top-[130px] relative">
            <Image
              src="/heart.svg"
              alt="heart icon."
              width="100"
              height="100"
            />
          </div>
          <div className="left-[468px] top-[33px] relative">
            <Image
              src="/heart.svg"
              alt="heart icon."
              width="100"
              height="100"
            />
          </div>
          <div className="left-[398px] top-[306px] relative">
            <Image
              src="/heart.svg"
              alt="heart icon."
              width="100"
              height="100"
            />
          </div>
          <div className="left-[250px] top-[277px] relative">
            <Image
              src="/heart.svg"
              alt="heart icon."
              width="100"
              height="100"
            />
          </div>
          <div className="left-[284px] top-[167px] relative">
            {" "}
            <Image
              src="/heart.svg"
              alt="heart icon."
              width="100"
              height="100"
            />
          </div>
          <div className="left-[191px] top-[34px] relative">
            {" "}
            <Image
              src="/heart.svg"
              alt="heart icon."
              width="100"
              height="100"
            />
          </div>
          <div className="left-[165px] top-[389px] relative">
            {" "}
            <Image
              src="/heart.svg"
              alt="heart icon."
              width="100"
              height="100"
            />
          </div>
          <div className="left-0 top-[159px] relative">
            {" "}
            <Image
              src="/heart.svg"
              alt="heart icon."
              width="100"
              height="100"
            />
          </div>
        </div>
      </section> */}
      <LandingPageHeading title="Find ideas to build for Nouns" />

      <section className="flex flex-1 flex-col gap-lg max-w-screen-xl mx-auto px-lg w-full">
        <div className="text-black text-xxl font-londrina text-center">
          What ideas are you looking for?
        </div>
        <TagButtons />
        <div className="gap-lg flex flex-row flex-wrap items-center w-full overflow-x-scroll scrollbar-hide">
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

      <section className="flex flex-1 flex-col gap-lg max-w-screen-xl mx-auto px-lg mt-xl w-full">
        <h2 className="text-left font-londrinaLight text-black text-xxl font-light md:w-1/2">
          Explore and build for Nouns A community that funds cool stuff
        </h2>
        <div className="flex-wrap text-base font-inter justify-start items-start gap-lg inline-flex">
          <div className="min-w-[350px] flex-1 self-stretch p-xl bg-white rounded-xl border border-slate flex-col justify-start items-start gap-xl inline-flex">
            <div className="self-stretch text-black text-lg font-bold">
              Daily auctions bring in
              <br />
              new members and funds
            </div>
            <div className="self-stretch h-96 p-4 bg-grey rounded-2xl border border-black flex-col justify-center items-center gap-sm flex">
              <img
                className="w-56 h-56"
                src="https://via.placeholder.com/220x220"
              />
              <div className="flex-col justify-start items-center gap-1 flex">
                <div className="text-black font-londrina text-xl font-normal">
                  Today’s Noun
                </div>
                <div className="text-center text-slate text-lg font-bold">
                  Current bid
                </div>
                <div className="text-center text-black text-lg font-bold">
                  Ξ 29
                </div>
              </div>
            </div>
            <div className="self-stretch px-lg bg-[#E1D7D5] rounded-2xl border border-black justify-start items-center gap-sm inline-flex">
              <img
                className="w-16 h-16"
                src="https://via.placeholder.com/72x72"
              />
              <div className="rounded-lg flex-col justify-start items-start inline-flex">
                <div className="text-black text-base font-bold">Noun 754</div>
                <div className="justify-start items-start gap-2 inline-flex">
                  <div className="opacity-50 text-black text-base font-bold">
                    Sold for
                  </div>
                  <div className="pb-px justify-start items-start flex">
                    <div className="text-black text-base font-bold">Ξ 32</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch px-lg bg-grey rounded-2xl border border-black justify-start items-center gap-sm inline-flex">
              <img
                className="w-16 h-16"
                src="https://via.placeholder.com/72x72"
              />
              <div className="rounded-lg flex-col justify-start items-start inline-flex">
                <div className="text-black text-base font-bold">Noun 753</div>
                <div className="justify-start items-start gap-sm inline-flex">
                  <div className="opacity-50 text-black text-base font-bold">
                    Sold for
                  </div>
                  <div className="pb-px justify-start items-start flex">
                    <div className="text-black text-base font-bold">Ξ 30</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch px-lg bg-grey rounded-2xl border border-black justify-start items-center gap-sm inline-flex">
              <img
                className="w-16 h-16"
                src="https://via.placeholder.com/72x72"
              />
              <div className="rounded-lg flex-col justify-start items-start inline-flex">
                <div className="text-black text-base font-bold">Noun 752</div>
                <div className="justify-start items-start gap-sm inline-flex">
                  <div className="opacity-50 text-black text-base font-bold">
                    Sold for
                  </div>
                  <div className="pb-px justify-start items-start flex">
                    <div className="text-black text-base font-bold">Ξ 29</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grow basis-3/5 flex-1 self-stretch flex-col justify-start items-start gap-lg inline-flex">
            <div className="flex-wrap grow shrink self-stretch justify-start items-start gap-lg inline-flex">
              <div className="min-w-[350px] flex-1 self-stretch p-md bg-white justify-center rounded-xl border border-slate flex-col justify-start items-start gap-lg inline-flex">
                <div className="xl:max-w-[300px] self-stretch text-lg font-bold">
                  $60M treasury to fund your projects and ideas
                </div>
                <div className="flex-1 self-stretch p-md bg-[#FFC925] rounded-2xl border border-black justify-center items-center gap-lg inline-flex">
                  <div className="w-20 h-20 relative">
                  <Image
                    width="100"
                    height="100"
                    alt="noggles"
                    className="grow shrink basis-0 self-stretch"
                    src="/noggles.svg"
                  />
                  </div>
                  <div className="px-sm py-sm whitespace-nowrap bg-white rounded-lg border border-black justify-start items-start gap-md flex">
                    <div className="opacity-50 text-black text-base font-bold">
                      Treasury
                    </div>
                    <div className="pb-px justify-start items-start flex">
                      <div className="text-black text-base font-bold">
                        Ξ 28,850
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="min-w-[450px] grow shrink self-stretch p-md bg-white rounded-xl border border-slate flex-col justify-start items-start gap-lg inline-flex">
                <div className="self-stretch text-lg font-bold leading-7">
                  Democratic onchain vote to release funds
                </div>
                <div className="flex-1 self-stretch p-lg bg-pink rounded-2xl border border-black justify-center items-center gap-md inline-flex">
                  <div className="grow shrink basis-0 self-stretch flex-col justify-start items-start gap-sm inline-flex">
                    <div className="self-stretch px-md py-sm bg-white rounded-2xl border border-black justify-start items-center gap-md inline-flex">
                      <div className="grow justify-start items-start gap-sm flex">
                        <div className="text-base font-bold">400</div>
                        <div className="text-base font-bold">
                          Paint a mural in NY
                        </div>
                      </div>
                      <div className="self-stretch justify-end items-center gap-sm flex">
                        <div className="px-sm py-xs bg-green rounded-lg justify-center items-center flex">
                          <div className="text-center text-white text-sm font-bold">
                            Active
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch px-md py-sm bg-white rounded-2xl border border-black justify-start items-center gap-md inline-flex">
                      <div className="grow justify-start items-start gap-sm flex">
                        <div className="text-neutral-400 text-base font-bold">
                          399
                        </div>
                        <div className="text-black text-base font-bold">
                          IOS App for voting
                        </div>
                      </div>
                      <div className="self-stretch justify-end items-center gap-sm flex">
                        <div className="px-sm py-xs bg-purple rounded-lg justify-center items-center flex">
                          <div className="text-center text-white text-sm font-bold">
                            Executed
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch px-md py-sm bg-white rounded-2xl border border-black justify-start items-center gap-md inline-flex">
                      <div className="grow justify-start items-start gap-sm flex">
                        <div className="text-neutral-400 text-base font-bold">
                          398
                        </div>
                        <div className="text-black text-base font-bold">
                          Giant float for NFT Fest 2023
                        </div>
                      </div>
                      <div className="self-stretch justify-end items-center gap-sm flex">
                        <div className="px-sm py-xs bg-purple rounded-lg justify-center items-center flex">
                          <div className="text-center text-white text-sm font-bold">
                            Executed
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch grow shrink p-xl bg-white rounded-xl border border-slate flex-col justify-center items-center gap-lg flex">
              <div className="self-stretch text-lg font-bold">
                Community with a global brand and 0 restrictions
              </div>
              <div className="self-stretch justify-start items-start gap-lg inline-flex">
                <div className="grow shrink basis-0 self-stretch rounded-2xl border border-black justify-center items-center flex">
                  <Image
                    width="100"
                    height="100"
                    alt="noun image placeholder"
                    className="grow shrink basis-0 self-stretch"
                    src="/noun-gif-placeholder-2.png"
                  />
                </div>
                <div className="grow shrink basis-0 self-stretch rounded-2xl border border-black justify-center items-center flex">
                  <Image
                    width="100"
                    height="100"
                    alt="noun image placeholder"
                    className="grow shrink basis-0 self-stretch"
                    src="/noun-gif-placeholder-1.png"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="!font-ptRootUI flex flex-1 justify-center px-[20px] xl:px-0 py-[72px] gap-8">
        <FAQAccordion />
      </section>
    </main>
  );
}
