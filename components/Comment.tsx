import { useState } from "react";
import { useRouter } from "next/router";
import { useEthers } from "@usedapp/core";
import { useParams } from "react-router-dom";
// import { useReverseENSLookUp } from "@/utils/ensLookup";
import { useShortAddress } from "@/utils/addressAndENSDisplayUtils";
import moment from "moment";
import CommentInput from "@/components/CommentInput";
import { useIdeas, Comment as CommentType } from "@/hooks/useIdeas";

const Comment = ({
  comment,
  hasTokens,
  level,
  isIdeaClosed,
}: {
  comment: CommentType;
  hasTokens: boolean;
  level: number;
  isIdeaClosed: boolean;
}) => {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [isReply, setIsReply] = useState<boolean>(false);
  const [showReplies, setShowReplies] = useState<boolean>(level > 1);
  const { account, library: provider } = useEthers();
  // const ens = useReverseENSLookUp(comment.authorId);
  const ens = "ens.eth";
  const shortAddress = useShortAddress(comment.authorId);
  const { deleteComment } = useIdeas();

  return (
    <div key={comment.id}>
      {!comment.deleted ? (
        <>
          <div className="flex flex-row items-center space-x-4">
            <span className="text-2xl text-[#8C8D92] flex align-items-center">
              {/* <Davatar
                size={28}
                address={comment.authorId}
                provider={provider}
              /> */}
              <span
                className="lodrina pl-2 text-[#2B83F6] underline cursor-pointer"
                onClick={() => {
                  router.replace(`/proplot/profile/${comment.authorId}`);
                }}
              >
                {ens || shortAddress}
              </span>
              <span className="text-[#8C8D92] text-base pl-2">
                {moment(comment.createdAt).fromNow()}
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
            {comment.authorId === account && (
              <span
                className="text-red-500 cursor-pointer"
                onClick={async () => {
                  await deleteComment(Number(id), comment.id);
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
                  comment={reply}
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
