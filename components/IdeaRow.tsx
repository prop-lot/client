import { useEffect, useState } from "react";
import moment from "moment";
import { useAccount, useEnsName } from "wagmi";
import { createBreakpoint } from "react-use";
import { useShortAddress } from "@/utils/addressAndENSDisplayUtils";
import IdeaVoteControls from "./IdeaVoteControls";
import { getPropLot_propLot_ideas as Idea } from "@/graphql/types/__generated__/getPropLot";
import { virtualTagColorMap } from "@/utils/virtualTagColors";
import { DELETE_IDEA__MUTATION } from "@/graphql/queries/propLotMutations";
import { deleteIdea } from "@/graphql/types/__generated__/deleteIdea";
import { useMutation } from "@apollo/client";
import { useAuth } from "@/hooks/useAuth";
import { useApiError } from "@/hooks/useApiError";
import Modal from "@/components/Modal";
import Router from "next/router";

const useBreakpoint = createBreakpoint({ XL: 1440, L: 940, M: 650, S: 540 });

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  
  const day = date.getDate();
  const year = date.getFullYear();
  
  const monthIndex = date.getMonth();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthName = months[monthIndex];

  return `${day} ${monthName}, ${year}`;
}

const IdeaRow = ({
  idea,
  nounBalance,
  disableControls,
  refetch,
  communityName,
}: {
  idea: Idea;
  nounBalance: number;
  disableControls?: boolean;
  refetch: () => void;
  communityName: string;
}) => {
  const { address: account } = useAccount();
  const { isLoggedIn, triggerSignIn } = useAuth();
  const { setError, error: errorModalVisible } = useApiError();
  const breakpoint = useBreakpoint();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
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

  const { data: creatorEns } = useEnsName({
    address: creatorId as `0x${string}`,
    cacheTime: 6_000,
  });
  const shortAddress = useShortAddress(creatorId);
  const creatorTokenWeight = votes?.find(
    (vote: any) => vote.voterId === creatorId
  )?.voterWeight;

  const [deleteIdeaMutation, { error, loading: isDeleting }] =
    useMutation<deleteIdea>(DELETE_IDEA__MUTATION, {
      onCompleted: () => {
        refetch();
      },
    });

  const deleteIdea = async () => {
    if (!isLoggedIn) {
      try {
        const { success } = await triggerSignIn();
        if (success) {
          deleteIdeaMutation({ variables: { id } });
        } else {
          setError({ message: "Failed to sign in", status: 401 });
        }
      } catch (e) {
        console.log(e);
        setError({ message: "Failed to sign in", status: 401 });
      }
    } else {
      deleteIdeaMutation({ variables: { id } });
    }
  };

  useEffect(() => {
    if (error && !errorModalVisible) {
      setError({
        message: error?.message || "Failed to delete idea",
        status: 500,
      });
    }
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {showDeleteModal && (
        <Modal
          title="Delete Idea?"
          description="Are you sure you want to delete this idea? It cannot be undone."
          action={{
            title: "Delete",
            fn: async () => {
              if (isDeleting) {
                return undefined;
              }
              await deleteIdea();
              setShowDeleteModal(false);
            },
          }}
          isOpen={showDeleteModal}
          setIsOpen={setShowDeleteModal}
        />
      )}
      {deleted ? (
        <div className="bg-grey p-lg rounded-[10px]">
          This idea cannot be found.
        </div>
      ) : (
        <div
          className="flex flex-row w-full border border-grey rounded-[10px] cursor-pointer p-md bg-white gap-sm min-w-[800px]"
          onClick={() => {
            Router.push(`/ideas/${id}`);
          }}
        >
          <>
            <div className="font-ptRootUI font-medium text-base flex flex-row flex-1 justify-content-start align-items-start">
              <div className="flex flex-1 flex-row gap-lg">
                <div className="flex flex-col flex-0">
                  <span className="flex text-light-green overflow-hidden">
                    <span className="font-bold truncate">
                      {creatorEns || shortAddress}
                    </span>
                  </span>
                </div>
                <div className="flex flex-col flex-1 justify-content-start align-items-start gap-sm">
                  <span className="font-bold text-black flex flex-1">
                    {title}
                  </span>
                  {tags && tags.length > 0 && (
                    <div className="flex flex-row items-center flex-wrap gap-sm">
                      {tags.map((tag: any, idx) => {
                        return (
                          <span
                            key={tag.type}
                            className={`${
                              virtualTagColorMap[tag.type] ||
                              "text-black bg-grey"
                            } text-xs font-bold rounded-[6px] px-sm py-xs flex`}
                          >
                            {tag.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="flex-col justify-start items-start gap-xs inline-flex">
                  <div className="text-black text-base font-semibold leading-normal">{formatDate(createdAt)}</div>
                  <div className="text-slate text-sm font-normal leading-tight">Posted</div>
                </div>
                {ideaStats?.proposalCount > 0 && (
                <div className="flex-col justify-start items-start gap-xs inline-flex">
                <div className="text-black text-base font-semibold leading-normal">{ideaStats.proposalCount}</div>
                <div className="text-slate text-sm font-normal leading-tight">Proposals</div>
              </div>
                )}
                <div className="flex-col justify-center items-center gap-xs inline-flex">
                  <IdeaVoteControls
                    idea={idea}
                    nounBalance={nounBalance}
                    withAvatars={!isMobile}
                    refetchPropLotOnVote
                    disableControls={disableControls}
                  />
                </div>
              </div>
            </div>
          </>
        </div>
      )}
    </>
  );
};

export default IdeaRow;
