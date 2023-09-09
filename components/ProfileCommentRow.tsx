import { useEffect } from 'react';
import { useEnsName, useAccount } from "wagmi";
import { useMutation } from "@apollo/client";
import { useAuth } from "@/hooks/useAuth";

import { useShortAddress } from '@/utils/addressAndENSDisplayUtils';
import { getPropLotProfile_propLotProfile_list_Comment as Comment } from '@/graphql/types/__generated__/getPropLotProfile';
import { DELETE_IDEA_COMMENT_MUTATION } from "@/graphql/queries/propLotMutations";
import { deleteIdeaComment } from "@/graphql/types/__generated__/deleteIdeaComment";

import Card from 'react-bootstrap/Card';
import moment from 'moment';

import { useLazyQuery } from '@apollo/client';
import { BigNumber } from 'ethers';
import { TOKEN_BALANCES_BY_OWNER_SUB } from '@/graphql/subgraph';
import { StandaloneNounCircular } from '@/components/NounCircular';
import { SUPPORTED_SUBDOMAINS } from '@/utils/supportedTokenUtils';
import { useApiError } from '@/hooks/useApiError';

const ProfileCommentRow = ({ comment, refetch, communityName }: { comment: Comment; refetch: () => void; communityName: SUPPORTED_SUBDOMAINS; }) => {
  const { idea, parent, parentId, createdAt, body, deleted } = comment;
  const { isLoggedIn, triggerSignIn } = useAuth();
  const { setError, error: errorModalVisible } = useApiError();
  const wallet = parentId && parent ? parent.authorId : idea?.creatorId;
  const { data: creatorEns } = useEnsName({
    address: wallet as `0x${string}`,
    cacheTime: 6_000,
  });
  const shortAddress = useShortAddress(wallet || '');
  const { address: account } = useAccount();

  const [getTokenBalances, { data: tokenBalanceData }] = useLazyQuery(
    TOKEN_BALANCES_BY_OWNER_SUB,
    {
      context: {
        clientName: communityName,
      },
    },
  );

  const [deleteCommentMutation, { error }] =
  useMutation<deleteIdeaComment>(DELETE_IDEA_COMMENT_MUTATION, {
    onCompleted() {
      refetch();
    }
  });

  const getDeleteCommentMutationArgs = () => ({
    context: {},
    variables: {
      id: comment.id
    },
  });


  useEffect(() => {
    if (error && !errorModalVisible) {
      setError({ message: error?.message || "Failed to delete comment", status: 500 });
    }
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

  const deleteComment = async () => {
    if (!isLoggedIn) {
      try {
        const { success } = await triggerSignIn();
        if (success) {
          deleteCommentMutation(getDeleteCommentMutationArgs());
        } else {
          setError({ message: "Failed to sign in", status: 401 });
        }
      } catch (e) {
        console.log(e);
        setError({ message: "Failed to sign in", status: 401 });
      }
    } else {
      deleteCommentMutation(getDeleteCommentMutationArgs());
    }
  };

  useEffect(() => {
    if (!!parent) {
      getTokenBalances({
        variables: {
          id: parent.authorId.toLowerCase(),
        },
      });
    }
  }, [parent]);

  const tokenData = tokenBalanceData?.account?.tokens || [];

  const renderCommentCard = () => {
    const content = deleted ? (
      <div className="bg-gray-100 rounded p-4">This comment cannot be found.</div>
    ) : (
      <Card className="border border-[#E2E3E8] !rounded-[16px] box-border bg-white">
        <Card.Header className="bg-white font-semibold text-dark-grey text-[12px] !rounded-[16px] !border-0">
          <div className="flex flex-1 flex-row items-center gap-[8px] border-solid !border-[#E2E3E8] border-b-1 border-l-0 border-r-0 border-t-0 pb-[8px]">
            <span className="flex text-dark-grey overflow-hidden gap-[8px] items-center">
              {Boolean(tokenData.length) ? (
                <StandaloneNounCircular
                  nounId={BigNumber.from(tokenData[0].id)}
                  seed={tokenData[0].seed}
                  height={20}
                  width={20}
                  isBigNoun={communityName === SUPPORTED_SUBDOMAINS.NOUNS}
                />
              ) : (
                <span>{idea?.id}</span>
              )}
              <span className="truncate">{creatorEns || shortAddress}</span>
            </span>
            <span className="text-[#212529] truncate">
              {parentId && parent ? parent.body : idea?.title}
            </span>
          </div>
        </Card.Header>
        <Card.Body className="flex flex-col !p-[16px] gap-[8px]">
          <Card.Text className="font-medium text-[16px] text-[#212529] !mb-[0px] !p-[0px]">
            {body}
          </Card.Text>
          <Card.Text className="font-semibold text-[12px] text-dark-grey !mb-[0px] !p-[0px]">
            {moment(createdAt).format('MMM Do YYYY')}
            {comment.authorId === account && (
              <span
                className="text-red-500 cursor-pointer ml-2"
                onClick={async () => {
                  await deleteComment();
                }}
              >
                Delete
              </span>
            )}
          </Card.Text>
        </Card.Body>
      </Card>
    );

    return content;
  };

  return renderCommentCard();
};

export default ProfileCommentRow;
