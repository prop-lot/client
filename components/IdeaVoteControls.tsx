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
      fetchPolicy: "no-cache",
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
        setError({
          message:
            "You can't vote on this idea as you didn't own enough tokens when the idea was created.",
          status: 401,
        });
      } else {
        setError({ message: error?.message || "Failed to vote", status: 500 });
      }
    }
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

  // Optimistic update of the voteCount for quick user feedback.
  useEffect(() => {
    if (data?.submitIdeaVote.ideaId === id) {
      const voteResponse = data?.submitIdeaVote;
      const multiplier = usersVote ? 2 : 1;

      setCalculatedVoteCount(
        calculatedVoteCount +
          voteResponse?.direction *
            multiplier *
            (voteResponse?.voterWeight || 0)
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
            <span
              key={vote.id}
              className={i < avatarVotes.length - 1 ? "-mr-2" : ""}
            >
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

      <div className="justify-start items-center gap-[8px] inline-flex">
        <div className="w-16 text-center text-black text-[24px] font-bold">
          {calculatedVoteCount}
        </div>
        {/* {!closed && !disableControls && ( */}
          <>
            <div
              className="h-9 p-1.5 flex bg-white rounded-xl border border-gray-200 justify-start items-start"
              onClick={(e) => {
                e.stopPropagation();
                if (hasVotes && !userHasUpVote && !loading && !closed) {
                  vote(1);
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.29259 10.293C6.19708 10.3852 6.1209 10.4956 6.06849 10.6176C6.01608 10.7396 5.9885 10.8708 5.98734 11.0036C5.98619 11.1364 6.01149 11.2681 6.06177 11.391C6.11205 11.5139 6.18631 11.6255 6.2802 11.7194C6.37409 11.8133 6.48574 11.8875 6.60864 11.9378C6.73154 11.9881 6.86321 12.0134 6.99599 12.0123C7.12877 12.0111 7.25999 11.9835 7.382 11.9311C7.504 11.8787 7.61435 11.8025 7.70659 11.707L10.9996 8.414V19C10.9996 19.2652 11.1049 19.5196 11.2925 19.7071C11.48 19.8946 11.7344 20 11.9996 20C12.2648 20 12.5192 19.8946 12.7067 19.7071C12.8942 19.5196 12.9996 19.2652 12.9996 19V8.414L16.2926 11.707C16.4812 11.8892 16.7338 11.99 16.996 11.9877C17.2582 11.9854 17.509 11.8802 17.6944 11.6948C17.8798 11.5094 17.985 11.2586 17.9873 10.9964C17.9895 10.7342 17.8888 10.4816 17.7066 10.293L12.7066 5.293C12.5191 5.10553 12.2648 5.00021 11.9996 5.00021C11.7344 5.00021 11.4801 5.10553 11.2926 5.293L6.29259 10.293Z"
                  fill="#34AC80"
                />
              </svg>
            </div>
            <div
              className="h-9 p-1.5 flex bg-white rounded-xl border border-gray-200 justify-start items-start"
              onClick={(e) => {
                e.stopPropagation();
                if (hasVotes && !userHasDownVote && !loading && !closed) {
                  vote(-1);
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M17.7074 13.707C17.8029 13.6148 17.8791 13.5044 17.9315 13.3824C17.9839 13.2604 18.0115 13.1292 18.0127 12.9964C18.0138 12.8636 17.9885 12.7319 17.9382 12.609C17.8879 12.4861 17.8137 12.3745 17.7198 12.2806C17.6259 12.1867 17.5143 12.1125 17.3914 12.0622C17.2685 12.0119 17.1368 11.9866 17.004 11.9877C16.8712 11.9889 16.74 12.0165 16.618 12.0689C16.496 12.1213 16.3857 12.1975 16.2934 12.293L13.0004 15.586V5C13.0004 4.73478 12.8951 4.48043 12.7075 4.29289C12.52 4.10536 12.2656 4 12.0004 4C11.7352 4 11.4808 4.10536 11.2933 4.29289C11.1058 4.48043 11.0004 4.73478 11.0004 5V15.586L7.70741 12.293C7.51881 12.1108 7.2662 12.01 7.00401 12.0123C6.74181 12.0146 6.491 12.1198 6.30559 12.3052C6.12018 12.4906 6.01501 12.7414 6.01273 13.0036C6.01045 13.2658 6.11125 13.5184 6.29341 13.707L11.2934 18.707C11.4809 18.8945 11.7352 18.9998 12.0004 18.9998C12.2656 18.9998 12.5199 18.8945 12.7074 18.707L17.7074 13.707Z"
                  fill="#D63C5E"
                />
              </svg>
            </div>
          </>
        {/* )} */}
      </div>
    </div>
  );
};

export default IdeaVoteControls;
export {};
