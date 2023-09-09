import Image from "next/image";

import { Community } from "@prisma/client";

import Link from "next/link";
import { formatEthValue } from "@/utils/ethers";
import { StandaloneNounCircular } from "./NounCircular";
import { BigNumber } from "ethers";
import useHomeLiveData from "@/hooks/useHomeLiveData";

const CommunityHomeLiveDataBoard = ({
  community,
}: {
  community: Community;
}) => {
  const liveData = useHomeLiveData(community.uname);

  return (
    <section className="flex flex-1 flex-col gap-lg max-w-screen-xl mx-auto px-lg mt-xl w-full">
      <h2 className="text-left font-londrinaLight text-black text-xxl font-light md:w-1/2">
        Explore and build for Nouns A community that funds cool stuff
      </h2>
      <div className="flex-wrap text-base font-inter justify-start items-start gap-lg inline-flex">
        <div className="min-w-[350px] max-h-[500px] md:max-h-[800px] overflow-scroll flex-1 self-stretch p-xl bg-white rounded-xl border border-slate flex-col justify-start items-start gap-xl inline-flex">
          <div className="self-stretch text-black text-lg font-bold">
            Daily auctions bring in
            <br />
            new members and funds
          </div>
          <div className="self-stretch h-96 p-4 bg-grey rounded-2xl border border-black flex-col justify-center items-center gap-sm flex">
            {liveData.currentAuction && (
              <Link
                href={`https://nouns.wtf/noun/${liveData.currentAuction?.noun?.id}`}
                target="_blank"
                className="h-[220px] w-[220px]"
              >
                <StandaloneNounCircular
                  nounId={BigNumber.from(
                    liveData.currentAuction?.noun?.id || 1
                  )}
                  seed={liveData.currentAuction?.noun?.seed}
                  height={46}
                  width={46}
                  isBigNoun={true}
                />
              </Link>
            )}

            <div className="flex-col justify-start items-center gap-1 flex">
              <div className="text-black font-londrina text-xl font-normal">
                Today’s Noun
              </div>
              <div className="text-center text-slate text-lg font-bold">
                Current bid
              </div>
              <div className="text-center text-black text-lg font-bold">
                Ξ
                {liveData.currentAuction?.amount &&
                  formatEthValue(
                    liveData.currentAuction?.amount
                  ).toLocaleString()}
              </div>
            </div>
          </div>
          {liveData?.previousAuctions?.map((auction: any, idx) => {
            return (
              <div
                key={auction.id}
                className={`self-stretch px-lg ${
                  idx % 2 === 0 ? "bg-[#E1D7D5]" : "bg-[#D5D7E1]"
                } rounded-2xl border border-black justify-start items-center gap-sm inline-flex`}
              >
                <Link
                  href={`https://nouns.wtf/noun/${auction?.noun?.id}`}
                  target="_blank"
                  className="h-[72px] w-[72px]"
                >
                  <StandaloneNounCircular
                    nounId={BigNumber.from(auction.noun?.id || 1)}
                    seed={auction.noun?.seed}
                    height={18}
                    width={18}
                    isBigNoun={true}
                  />
                </Link>
                <div className="rounded-lg flex-col justify-start items-start inline-flex">
                  <div className="text-black text-base font-bold">Noun {auction.noun?.id}</div>
                  <div className="justify-start items-start gap-2 inline-flex">
                    <div className="opacity-50 text-black text-base font-bold">
                      Sold for
                    </div>
                    <div className="pb-px justify-start items-start flex">
                      <div className="text-black text-base font-bold">
                        Ξ {formatEthValue(auction.amount || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="grow basis-3/5 flex-1 self-stretch flex-col justify-start items-start gap-lg inline-flex">
          <div className="flex-wrap grow shrink self-stretch justify-start items-start gap-lg inline-flex">
            <div className="min-w-[350px] max-h-[300px] flex-1 self-stretch p-md bg-white justify-center rounded-xl border border-slate flex-col justify-start items-start gap-lg inline-flex">
              <div className="xl:max-w-[300px] self-stretch text-lg font-bold">
                Ξ{formatEthValue(liveData?.balance || 0)} treasury
                to fund your projects and ideas
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
                      Ξ {formatEthValue(liveData?.balance || 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="min-w-[450px] max-h-[300px] flex-1 grow shrink self-stretch p-md bg-white rounded-xl border border-slate flex-col justify-start items-start gap-lg inline-flex">
              <div className="self-stretch text-lg font-bold">
                Democratic onchain vote to release funds
              </div>
              <div className="flex-1 self-stretch p-lg bg-pink overflow-scroll rounded-2xl border border-black justify-center items-center gap-md inline-flex">
                <div className="grow shrink basis-0 self-stretch flex-col justify-start items-start gap-sm inline-flex">
                  {liveData?.recentProposals?.map((proposal: any) => {
                    let tagColor = "bg-green";
                    switch (proposal.status) {
                      case "ACTIVE":
                        tagColor = "bg-green";
                        break;
                      case "EXECUTED":
                        tagColor = "bg-purple";
                        break;
                      case "DEFEATED":
                        tagColor = "bg-red";
                        break;
                      case "QUEUED":
                        tagColor = "bg-yellow";
                        break;
                      case "PENDING":
                        tagColor = "bg-orange";
                        break;
                      case "CANCELED":
                        tagColor = "bg-grey";
                        break;
                      default:
                        tagColor = "bg-green";
                        break;
                    }
                    return (
                      <div
                        key={proposal.id}
                        className={`self-stretch px-md py-sm bg-white rounded-2xl border border-black justify-start items-center gap-md inline-flex`}
                      >
                        <Link
                          href={`https://nouns.wtf/vote/${proposal.id}`}
                          target="_blank"
                          className="self-stretch flex flex-1 gap-sm"
                        >
                          <div className="grow justify-start items-start gap-sm flex">
                            <div className="text-base font-bold">
                              {proposal.id}
                            </div>
                            <div className="text-base font-bold">
                              {proposal.title}
                            </div>
                          </div>
                          <div className="self-stretch justify-end items-center gap-sm flex">
                            <div
                              className={`px-sm py-xs ${tagColor} rounded-lg justify-center items-center flex`}
                            >
                              <div className="text-center text-white text-sm font-bold capitalize">
                                {proposal.status.toLowerCase()}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
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
  );
};

export default CommunityHomeLiveDataBoard;
