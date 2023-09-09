import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAccount, useEnsName } from "wagmi";
import { useMutation } from "@apollo/client";
import { useAuth } from "@/hooks/useAuth";
import { useShortAddress } from "@/utils/addressAndENSDisplayUtils";
import moment from "moment";
import CommentInput from "@/components/CommentInput";
import { DELETE_IDEA_COMMENT_MUTATION } from "@/graphql/queries/propLotMutations";
import {
  deleteIdeaComment,
  deleteIdeaComment_deleteIdeaComment as Comment,
  deleteIdeaComment_deleteIdeaComment_replies as Reply,
} from "@/graphql/types/__generated__/deleteIdeaComment";
import { useApiError } from "@/hooks/useApiError";
import Modal from "@/components/Modal";

const Comment = ({
  comment,
  hasTokens,
  level,
  isIdeaClosed,
}: {
  comment: Comment | Reply;
  hasTokens: boolean;
  level: number;
  isIdeaClosed: boolean;
}) => {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const { isLoggedIn, triggerSignIn } = useAuth();
  const { setError, error: errorModalVisible } = useApiError();
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
      id: comment.id,
    },
  });

  useEffect(() => {
    if (error && !errorModalVisible) {
      setError({
        message: error?.message || "Failed to delete comment",
        status: 500,
      });
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

  const commentData = deletedComment?.deleteIdeaComment || comment;

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null
  }

  return (
    <>
      {showDeleteModal && (
        <Modal
          title="Delete Comment?"
          description="Are you sure you want to delete this comment? It cannot be undone."
          action={{
            title: "Delete",
            fn: async () => {
              if (loading) {
                return undefined;
              }
              await deleteComment();
              setShowDeleteModal(false);
            },
          }}
          isOpen={showDeleteModal}
          setIsOpen={setShowDeleteModal}
        />
      )}
      <div key={commentData.id}>
        {!commentData.deleted ? (
          <>
            <div className="flex flex-row items-center space-x-4">
              <span className="text-2xl text-dark-grey flex align-items-center">
                {/* <Davatar
                size={28}
                address={commentData.authorId}
                provider={provider}
              /> */}
                <span
                  className="lodrina pl-2 text-[#2B83F6] underline cursor-pointer"
                  onClick={() => {
                    router.replace(`/profile/${commentData.authorId}`);
                  }}
                >
                  {creatorEns || shortAddress}
                </span>
                <span className="text-dark-grey text-base pl-2">
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
                  onClick={() => {
                    setShowDeleteModal(true);
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
                    comment={reply as Reply}
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
    </>
  );
};

export default Comment;
