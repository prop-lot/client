import { useState } from "react";
import { useRouter } from "next/router";
import { useAccount, useEnsName } from "wagmi";
import { useMutation } from "@apollo/client";
import { useAuth } from "@/hooks/useAuth";
import { useShortAddress } from "@/utils/addressAndENSDisplayUtils";
import moment from "moment";
import CommentInput from "@/components/CommentInput";
import { DELETE_IDEA_COMMENT_MUTATION } from "@/graphql/queries/propLotMutations";
import { deleteIdeaComment, deleteIdeaComment_deleteIdeaComment as Comment, deleteIdeaComment_deleteIdeaComment_replies as Reply } from "@/graphql/types/__generated__/deleteIdeaComment";

const Comment = ({
  comment,
  hasTokens,
  level,
  isIdeaClosed,
}: {
  comment: Comment;
  hasTokens: boolean;
  level: number;
  isIdeaClosed: boolean;
}) => {
  const router = useRouter();

  const { isLoggedIn, triggerSignIn } = useAuth();
  const [isReply, setIsReply] = useState<boolean>(false);
  const [showReplies, setShowReplies] = useState<boolean>(level > 1);
  const { address: account } = useAccount();
  const { data: creatorEns } = useEnsName({
    address: comment.authorId as `0x${string}`,
    cacheTime: 6_000,
  });
  const shortAddress = useShortAddress(comment.authorId);

  const [deleteCommentMutation, { error, loading, data: deletedComment }] =
    useMutation<deleteIdeaComment>(DELETE_IDEA_COMMENT_MUTATION);

  const getDeleteCommentMutationArgs = () => ({
    context: {},
    variables: {
      id: comment.id
    },
  });

  const deleteComment = async () => {
    if (!isLoggedIn) {
      try {
        const { success } = await triggerSignIn();
        if (success) {
          deleteCommentMutation(getDeleteCommentMutationArgs());
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      deleteCommentMutation(getDeleteCommentMutationArgs());
    }
  };

  const commentData = deletedComment?.deleteIdeaComment || comment;

  return (
    <div key={commentData.id}>
      {!commentData.deleted ? (
        <>
          <div className="flex flex-row items-center space-x-4">
            <span className="text-2xl text-[#8C8D92] flex align-items-center">
              {/* <Davatar
                size={28}
                address={commentData.authorId}
                provider={provider}
              /> */}
              <span
                className="lodrina pl-2 text-[#2B83F6] underline cursor-pointer"
                onClick={() => {
                  router.replace(`/proplot/profile/${commentData.authorId}`);
                }}
              >
                {creatorEns || shortAddress}
              </span>
              <span className="text-[#8C8D92] text-base pl-2">
                {moment(commentData.createdAt).fromNow()}
              </span>
            </span>
            {level < 4 && (
              <span
                className="text-[#2B83F6] text-base cursor-pointer"
                onClick={() => setIsReply(true)}
              >
                Reply
              </span>
            )}
            {commentData.authorId === account && (
              <span
                className="text-red-500 cursor-pointer"
                onClick={async () => {
                  if (loading) {
                    return undefined;
                  }
                  await deleteComment();
                }}
              >
                Delete
              </span>
            )}

            {/* Future addition: Add view more button to move deeper into the thread? */}
          </div>
          <p className="text-[#212529] text ml-2 whitespace-pre-wrap">
            {comment.body}
          </p>
        </>
      ) : (
        <div className="bg-gray-100 rounded p-4">
          This comment cannot be found.
        </div>
      )}

      {!!comment.replies?.length && level === 1 && (
        <span
          className="text-[#212529] text-base cursor-pointer font-bold mt-2 block"
          onClick={() => setShowReplies(!showReplies)}
        >
          {`${showReplies ? "Hide" : "Show"} replies`}
        </span>
      )}

      {showReplies && (
        <div>
          {comment.replies?.map((reply) => {
            return (
              <div className="ml-8 mt-2" key={`replies-${reply.id}`}>
                <Comment
                  comment={reply as Comment}
                  hasTokens={hasTokens}
                  level={level + 1}
                  isIdeaClosed={isIdeaClosed}
                />
              </div>
            );
          })}
        </div>
      )}

      {isReply && !isIdeaClosed && (
        <CommentInput
          parentId={comment.id}
          ideaId={comment.ideaId}
          hideInput={(isHidden: boolean) => setIsReply(!isHidden)}
          hasTokens={hasTokens}
        />
      )}
    </div>
  );
};

export default Comment;
