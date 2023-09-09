import { useEffect, useState } from "react";
import { createBreakpoint } from "react-use";
import { Button, FormControl } from "react-bootstrap";
import { useMutation } from "@apollo/client";
import { useAuth } from "@/hooks/useAuth";
import { SUBMIT_COMMENT_MUTATION } from "@/graphql/queries/propLotMutations";
import { submitIdeaComment } from "@/graphql/types/__generated__/submitIdeaComment";
import { useApiError } from "@/hooks/useApiError";

const useBreakpoint = createBreakpoint({ XL: 1440, L: 940, M: 650, S: 540 });

const CommentInput = ({
  hasTokens,
  ideaId,
  hideInput = undefined,
  parentId,
}: {
  ideaId: number;
  hasTokens: boolean;
  parentId: number | undefined;
  hideInput?: (val: boolean) => void;
}) => {
  const [commentValue, setCommentValue] = useState<string>("");
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === "S";
  const canHideInput = typeof hideInput === "function";
  const { isLoggedIn, triggerSignIn } = useAuth();
  const { setError, error: errorModalVisible } = useApiError();

  const [submitCommentMutation] = useMutation<submitIdeaComment>(SUBMIT_COMMENT_MUTATION, {
    context: {
      clientName: "PropLot",
    },
    refetchQueries: ["getIdeaComments"],
  });

  const getCommentMutationArgs = (
    ideaId: number,
    body: string,
    parentId: number | undefined
  ) => {
    return {
      context: {},
      variables: {
        options: {
          ideaId: ideaId,
          body,
          parentId,
        },
      },
    };
  };

  const submitComment = async (
    ideaId: number,
    body: string,
    parentId: number | undefined
  ) => {
    if (!isLoggedIn) {
      try {
        const { success } = await triggerSignIn();
        if (success) {
          await submitCommentMutation(
            getCommentMutationArgs(ideaId, body, parentId)
          );
        } else {
          setError({ message: "Failed to sign in", status: 401 });
        }
      } catch (e) {
        console.log(e);
        setError({ message: "Failed to sign in", status: 401 });
      }
    } else {
      await submitCommentMutation(
        getCommentMutationArgs(ideaId, body, parentId)
      );
    }
    setCommentValue("");
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null
  }

  return (
    <div className="relative mt-4">
      <FormControl
        as="textarea"
        placeholder="Type your commment..."
        value={commentValue}
        onChange={(e) => setCommentValue(e.target.value)}
        className={`border rounded-lg w-full pt-3 pb-3 pl-3 ${
          canHideInput && !isMobile ? "!pr-[162px]" : "!pr-[90px]"
        } relative`}
      />
      <div
        className={`absolute right-2 bottom-[10px] ${
          isMobile ? "flex align-items-center flex-column-reverse" : ""
        }`}
      >
        {canHideInput && (
          <span
            className={`font-bold text-dark-grey cursor-pointer ${
              isMobile ? "!pt-[8px]" : "mr-4"
            }`}
            onClick={() => hideInput(true)}
          >
            Cancel
          </span>
        )}

        <Button
          className={`${
            hasTokens
              ? "rounded-lg !bg-[#2B83F6] !text-white !font-bold"
              : "!text-dark-grey !bg-[#F4F4F8] !border-[#E2E3E8] !font-bold"
          } p-1 rounded`}
          onClick={() => {
            if (hasTokens && commentValue.length > 0) {
              submitComment(ideaId, commentValue, parentId);
            }
          }}
        >
          Comment
        </Button>
      </div>
    </div>
  );
};

export default CommentInput;
