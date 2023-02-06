import { useState } from "react";
import moment from "moment";
import { useAccount } from "wagmi";
import { createBreakpoint } from "react-use";
import { useShortAddress } from "@/utils/addressAndENSDisplayUtils";
import IdeaVoteControls from "./IdeaVoteControls";
import { getPropLot_propLot_ideas as Idea } from "@/graphql/types/__generated__/getPropLot";
import { virtualTagColorMap } from "@/utils/virtualTagColors";
import { useIdeas } from "@/hooks/useIdeas";
// import { useReverseENSLookUp } from "@/utils/ensLookup";

const useBreakpoint = createBreakpoint({ XL: 1440, L: 940, M: 650, S: 540 });

const IdeaRow = ({
  idea,
  nounBalance,
  disableControls,
  refetch,
}: {
  idea: Idea;
  nounBalance: number;
  disableControls?: boolean;
  refetch: () => void;
}) => {
  const { address: account, isConnecting, isDisconnected } = useAccount();
  const breakpoint = useBreakpoint();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const {
    id,
    tldr,
    title,
    creatorId,
    votes,
    createdAt,
    ideaStats,
    tags,
    deleted,
  } = idea;
  const isMobile = breakpoint === "S";

  const ens = "ENS.eth"; // TODO: replace
  // const ens = useReverseENSLookUp(creatorId);
  const shortAddress = useShortAddress(creatorId);
  const creatorLilNoun = votes?.find((vote: any) => vote.voterId === creatorId)
    ?.voter?.lilnounCount;
  const { deleteIdea } = useIdeas();

  const mobileHeading = (
    <>
      <div className="font-propLot font-bold text-[18px] flex flex-row flex-1 justify-content-between align-items-start">
        <span className="flex flex-col sm:flex-row text-[#8C8D92] overflow-hidden">
          <span className="flex flex-row flex-1 justify-content-start align-items-start">
            <span className="mr-4">{id}</span>
            <span className="truncate">{ens || shortAddress}</span>
          </span>
          <div className="flex flex-row flex-1 justify-content-start align-items-start pt-[16px]">
            <span className="font-bold text-[18px] text-[#212529] flex flex-1">
              {title}
            </span>
          </div>
        </span>
        <div className="flex justify-self-end">
          <IdeaVoteControls
            idea={idea}
            nounBalance={nounBalance}
            withAvatars={!isMobile}
            refetchPropLotOnVote
            disableControls={disableControls}
          />
        </div>
      </div>
      {tags && tags.length > 0 && (
        <div className="flex flex-row items-center flex-wrap gap-[8px] mt-[16px]">
          {tags.map((tag: any, idx) => {
            return (
              <span
                key={`tag-${idx}`}
                className={`${
                  virtualTagColorMap[tag.type] || "text-blue-500 bg-blue-200"
                } text-xs font-bold rounded-[8px] px-[8px] py-[4px] flex`}
              >
                {tag.label}
              </span>
            );
          })}
          <span className="flex text-[#8c8d92] font-propLot font-semibold text-[14px]">
            {`${
              ideaStats?.comments === 1
                ? `${ideaStats?.comments} comment`
                : `${ideaStats?.comments || 0} comments`
            }`}
          </span>
        </div>
      )}
    </>
  );

  const desktopHeading = (
    <div className="font-propLot font-bold text-[18px] flex flex-row flex-1 justify-content-start align-items-start">
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1">
          <span className="flex text-[#8C8D92] overflow-hidden">
            <span className="mr-[8px] w-[48px]">{id}</span>
            <span className="truncate mr-[8px] w-[134px]">
              {ens || shortAddress}
            </span>
          </span>
          <span className="text-[#212529] flex flex-1">{title}</span>
        </div>
        {tags && tags.length > 0 && (
          <div className="flex flex-row items-center flex-wrap gap-[8px] mt-[16px]">
            {tags.map((tag: any, idx) => {
              return (
                <span
                  key={`tag-2-${idx}`}
                  className={`${
                    virtualTagColorMap[tag.type] ||
                    "text-[#2B83F6] bg-[#2B83F6] bg-opacity-10"
                  } text-xs font-semibold rounded-[8px] px-[8px] py-[4px] flex`}
                >
                  {tag.label}
                </span>
              );
            })}
            <span className="flex text-[#8c8d92] font-propLot font-semibold text-[14px]">
              {`${
                ideaStats?.comments === 1
                  ? `${ideaStats?.comments} comment`
                  : `${ideaStats?.comments || 0} comments`
              }`}
            </span>
          </div>
        )}
      </div>
      <div className="flex justify-self-end items-center">
        <IdeaVoteControls
          idea={idea}
          nounBalance={nounBalance}
          withAvatars={!isMobile}
          refetchPropLotOnVote
          disableControls={disableControls}
        />
      </div>
    </div>
  );

  return (
    <>
      {deleted ? (
        <div className="bg-gray-100 p-4 rounded">
          This idea cannot be found.
        </div>
      ) : (
        <div
          className="flex flex-col border border-[#e2e3e8] rounded-2xl cursor-pointer p-[16px] bg-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isMobile ? mobileHeading : desktopHeading}
          {isOpen && (
            <>
              <div className="flex flex-row flex-1 justify-content-start align-items-center pt-[24px] sm:pt-[16px]">
                <span
                  className="font-propLot text-[16px] text-[#212529] border border-[#e2e3e8] bg-[#F4F4F8] p-4 rounded-lg flex-1"
                  dangerouslySetInnerHTML={{ __html: tldr }}
                />
              </div>
              <div className="font-propLot font-semibold text-[14px] flex-col sm:flex-row flex flex-1 justify-content-start align-items-start pt-[24px] sm:pt-[16px]">
                <span className="flex flex-1 text-[#8c8d92] whitespace-pre sm:self-end">
                  <a
                    className="text-[#2B83F6] underline cursor-pointer"
                    href={`/proplot/profile/${idea.creatorId}`}
                  >
                    {ens || shortAddress}
                  </a>{" "}
                  {` | ${
                    creatorLilNoun === 1
                      ? `${creatorLilNoun} lil noun`
                      : `${creatorLilNoun} lil nouns`
                  } | ${moment(createdAt).format("MMM Do YYYY")}`}
                  {account &&
                    account.toLowerCase() === idea.creatorId.toLowerCase() && (
                      <span
                        onClick={async (event) => {
                          // stop propagation to prevent the card from closing
                          event.stopPropagation();
                          await deleteIdea(idea.id);
                          refetch();
                        }}
                        className="text-red-500 self-end font-bold ml-2"
                      >
                        Delete submission
                      </span>
                    )}
                </span>

                <span className="mt-[16px] sm:mt-[0px] w-full sm:w-auto justify-self-end text-[#2b83f6] flex justify-end">
                  <a
                    className="font-propLot font-semibold text-[16px] flex flex-1 btn !rounded-[10px] bg-white border border-[#E2E3E8] p-0 hover:!bg-[#F4F4F8] focus:!bg-[#E2E3E8] !text-[#2B83F6]"
                    href={`/idea/${id}`}
                  >
                    <span className="flex items-center justify-center font-semibold text-[16px] normal-case pt-[8px] pb-[8px] pl-[16px] pr-[16px]">
                      Details
                    </span>
                  </a>
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default IdeaRow;
