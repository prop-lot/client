// import Davatar from "@davatar/react";
import { useAccount } from "wagmi";
import { useApiError } from "@/hooks/useApiError";
import { useMutation } from "@apollo/client";
import { useAuth } from "@/hooks/useAuth";
import { SUBMIT_VOTE_MUTATION } from "@/graphql/queries/propLotMutations";
import { submitIdeaVote } from "@/graphql/types/__generated__/submitIdeaVote";
import { getPropLot_propLot_ideas as Idea } from "@/graphql/types/__generated__/getPropLot";

import { useEffect, useState } from "react";

const IdeaVoteControls = ({
  idea,
  nounBalance,
  withAvatars = false,
  refetchPropLotOnVote = false,
  disableControls = false,
}: {
  idea: Idea;
  nounBalance: number;
  withAvatars?: boolean;
  refetchPropLotOnVote?: boolean;
  disableControls?: boolean;
}) => {
  const { id, votecount: voteCount, closed, votes } = idea;
  const { address: account } = useAccount();

  const { isLoggedIn, triggerSignIn } = useAuth();
  const { setError, error: errorModalVisible } = useApiError();
  // Store voteCount in state that we can mutate for optimistic updates
  const [calculatedVoteCount, setCalculatedVoteCount] = useState(voteCount);

  const hasVotes = nounBalance > 0;

  const [submitVoteMutation, { error, loading, data }] =
    useMutation<submitIdeaVote>(SUBMIT_VOTE_MUTATION, {
      fetchPolicy: 'no-cache',
      errorPolicy: "all",
      refetchQueries: refetchPropLotOnVote ? ["getPropLot"] : [],
    });

  const getVoteMutationArgs = (direction: number) => ({
    context: {},
    variables: {
      options: {
        ideaId: id,
        direction: direction,
      },
    },
  });

  const vote = async (direction: number) => {
    if (!isLoggedIn) {
      try {
        const { success } = await triggerSignIn();
        if (success) {
          submitVoteMutation(getVoteMutationArgs(direction));
        } else {
          setError({ message: "Failed to sign in", status: 401 });
        }
      } catch (e) {
        console.log(e);
        setError({ message: "Failed to sign in", status: 401 });
      }
    } else {
      submitVoteMutation(getVoteMutationArgs(direction));
    }
  };

  const usersVote = votes?.find((vote) => vote.voterId === account);
  const userHasUpVote =
    (data?.submitIdeaVote?.direction || usersVote?.direction) === 1;
  const userHasDownVote =
    (data?.submitIdeaVote?.direction || usersVote?.direction) === -1;

  useEffect(() => {
    if (error && !errorModalVisible) {
      if (error?.message === "NO_VOTES_AT_BLOCK") {
        setError({ message: "You can't vote on this idea as you didn't own enough tokens when the idea was created.", status: 401 });
      } else {
        setError({ message: error?.message || "Failed to vote", status: 500 });
      }
    }
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

  // Optimistic update of the voteCount for quick user feedback.
  useEffect(() => {
    if (data?.submitIdeaVote.ideaId === id) {
      const voteResponse = data?.submitIdeaVote;
      const multiplier = usersVote ? 2 : 1

      setCalculatedVoteCount(
        calculatedVoteCount +
        voteResponse?.direction * multiplier * (voteResponse?.voterWeight || 0)
      );
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // // If optimistic updates become out of sync with the voteCount prop then reset
  // // to the prop value which comes from the latest API response.
  useEffect(() => {
    if (calculatedVoteCount !== voteCount) {
      setCalculatedVoteCount(voteCount);
    }
  }, [voteCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const avatarVotes = withAvatars ? votes?.slice(0, 3) || [] : [];

  return (
    <div className="flex flex-row items-center">
      {withAvatars && (
        <span className="flex self-center justify-end pl-2 mr-2">
          {avatarVotes.map((vote, i) => (
            <span key={vote.id} className={i < avatarVotes.length - 1 ? "-mr-2" : ""}>
              {/* <Davatar
                size={40}
                address={vote.voterId}
                provider={provider}
                style={{
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                }}
              /> */}
            </span>
          ))}
        </span>
      )}
      <span className="font-bold text-lg sm:text-2xl mr-4 min-w-[75px] text-right hidden sm:block">
        {calculatedVoteCount}
      </span>
      <div className="flex flex-[row] sm:flex-col items-center sm:items-end justify-center sm:justify-between space-x-3 sm:space-x-0 sm:space-y-1 sm:h-[65px]">
        {!closed && !disableControls && (
          <svg
            onClick={(e) => {
              e.stopPropagation();
              if (hasVotes && !userHasUpVote && !loading && !closed) {
                vote(1);
              }
            }}
            width="20"
            height="12"
            viewBox="0 0 20 12"
            fill={hasVotes && userHasUpVote ? "rgb(59 130 246)" : "#8c8d92"}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18.6523 11.6711H1.34765C0.149416 11.6711 -0.450643 10.2224 0.396621 9.37512L9.04896 0.722781C9.57417 0.19757 10.4258 0.19757 10.951 0.722781L19.6033 9.37512C20.4507 10.2224 19.8506 11.6711 18.6523 11.6711Z"
              fill={
                hasVotes && userHasUpVote ? "text-blue-500" : "text-[#8c8d92]"
              }
            />
          </svg>
        )}
        <span className="font-bold text-lg sm:text-2xl mr-4 sm:min-w-[75px] text-right block sm:hidden">
          {calculatedVoteCount}
        </span>
        {!closed && !disableControls && (
          <svg
            width="20"
            height="12"
            viewBox="0 0 20 12"
            fill={hasVotes && userHasDownVote ? "rgb(239 68 68)" : "#8c8d92"}
            xmlns="http://www.w3.org/2000/svg"
            onClick={(e) => {
              e.stopPropagation();
              if (hasVotes && !userHasDownVote && !loading && !closed) {
                vote(-1);
              }
            }}
          >
            <path
              d="M1.34572 0.327469H18.6543C19.8517 0.327469 20.4504 1.77377 19.6028 2.62137L10.9519 11.279C10.4272 11.8037 9.57283 11.8037 9.04813 11.279L0.397216 2.62137C-0.450385 1.77377 0.148317 0.327469 1.34572 0.327469Z"
              fill={hasVotes && userHasDownVote ? "rgb(239 68 68)" : "#8c8d92"}
            />
          </svg>
        )}
      </div>
    </div>
  );
};

export default IdeaVoteControls;
export {};
