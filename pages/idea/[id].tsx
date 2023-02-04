import { useState, useEffect } from "react";
import { Col, Row, Container } from "react-bootstrap";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleLeft } from "@fortawesome/free-solid-svg-icons";
// import { useReverseENSLookUp } from "@/utils/ensLookup";
import { useShortAddress } from "@/utils/addressAndENSDisplayUtils";
import { useIdeas, CommentFormData } from "@/hooks/useIdeas";
// import { useAuth } from "../../../hooks/useAuth";
// import { useAccountVotes } from "../../../wrappers/nounToken";
import moment from "moment";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { getIdea } from "@/graphql/types/__generated__/getIdea";
import { useLazyQuery } from "@apollo/client";
import { GET_IDEA_QUERY } from "@/graphql/queries/ideaQuery";
import { virtualTagColorMap } from "@/utils/virtualTagColors";
import IdeaVoteControls from "@/components/IdeaVoteControls";
import Comment from "@/components/Comment";
import CommentInput from "@/components/CommentInput";
import { useMutation } from "@apollo/client";
import { useAuth } from "@/hooks/useAuth";
import { SUBMIT_COMMENT_MUTATION } from "@/graphql/queries/propLotMutations";
import { submitIdeaComment } from "@/graphql/types/__generated__/submitIdeaComment";

const renderer = new marked.Renderer();
const linkRenderer = renderer.link;
renderer.link = (href: string, title: string, text: string) => {
  const localLink = href?.startsWith(
    `${location.protocol}//${location.hostname}`
  );
  const html = linkRenderer.call(renderer, href, title, text);
  return localLink
    ? html
    : html.replace(
        /^<a /,
        `<a target="_blank" rel="noreferrer noopener nofollow" `
      );
};

marked.setOptions({
  renderer: renderer,
});

const IdeaPage = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { isLoggedIn, triggerSignIn } = useAuth();
  const [comment, setComment] = useState<string>("");

  const [getIdeaQuery, { data, error: _getIdeaError }] = useLazyQuery<getIdea>(
    GET_IDEA_QUERY,
    {
      context: {
        clientName: "PropLot",
        headers: {
          "proplot-tz": Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      },
    }
  );

  // const ens = useReverseENSLookUp(data?.getIdea?.creatorId || "");
  const ens = "ens.eth";
  const shortAddress = useShortAddress(data?.getIdea?.creatorId || "");

  useEffect(() => {
    if (id) {
      getIdeaQuery({ variables: { ideaId: parseInt(id) } });
    }
  }, [id]);

  const [submitCommentMutation, { error, loading, data: commentMutationData }] =
    useMutation<submitIdeaComment>(SUBMIT_COMMENT_MUTATION, {
      context: {
        clientName: "PropLot",
      },
      refetchQueries: ["getIdeaQuery"],
    });

  const getCommentMutationArgs = (body: string, parentId: number) => ({
    context: {},
    variables: {
      options: {
        ideaId: id,
        body,
        parentId,
      },
    },
  });

  const submitComment = async (body: string, parentId: number) => {
    if (!isLoggedIn) {
      try {
        const { success } = await triggerSignIn();
        if (success) {
          await submitCommentMutation(getCommentMutationArgs(body, parentId));
        }
      } catch (e) {
        console.log(e);
        return;
      }
    } else {
      await submitCommentMutation(getCommentMutationArgs(body, parentId));
    }
    setComment("");
  };

  // loading
  // todo: skeleton loading for better experience
  if (!data?.getIdea) {
    return <></>;
  }

  const tokenBalance = 10; // todo: replace
  const hasTokens = tokenBalance > 0;
  const creatorLilNoun = data.getIdea.votes?.find((vote) =>
    data.getIdea ? vote.voterId === data.getIdea.creatorId : false
  )?.voter?.lilnounCount;

  return (
    <Container fluid={"lg"} className="mt-8">
      <Row className="align-items-center">
        <Col lg={10} className="mx-auto">
          <Row>
            <div>
              <a
                className="cursor-pointer text-[#8C8D92] flex flex-row items-center"
                href="/"
              >
                <FontAwesomeIcon
                  icon={faArrowAltCircleLeft}
                  className={`mr-2 text-2xl cursor-pointer`}
                />
                <span className="text-lg lodrina">Back</span>
              </a>
            </div>
            <div className="flex flex-col mb-4">
              <div className="flex flex-row justify-between items-center">
                <h1 className="mb-0 lodrina text-5xl self-end">
                  {data.getIdea.title}
                </h1>
                <div className="flex flex-row justify-end">
                  <IdeaVoteControls
                    idea={data.getIdea}
                    nounBalance={tokenBalance}
                    withAvatars
                  />
                </div>
              </div>
              {data.getIdea.tags && data.getIdea.tags.length > 0 && (
                <div className="flex flex-row gap-[8px] mt-4 flex-wrap">
                  {data.getIdea.tags.map((tag) => {
                    return (
                      <span
                        className={`${
                          virtualTagColorMap[tag.type] ||
                          "text-blue-500 bg-blue-200"
                        } text-xs font-bold rounded-[8px] px-[8px] py-[4px] flex`}
                      >
                        {tag.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </Row>
          <div className="space-y-8">
            <div className="flex flex-col">
              <h3 className="lodrina font-bold text-2xl mb-2">tl:dr</h3>
              <p>{data.getIdea.tldr}</p>
            </div>
            <div className="flex flex-col">
              <h3 className="lodrina font-bold text-2xl mb-2">Description</h3>
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    marked.parse(data.getIdea.description),
                    {
                      ADD_ATTR: ["target"],
                    }
                  ),
                }}
              />
            </div>
          </div>

          <div className="flex flex-1 font-bold text-sm text-[#8c8d92] mt-12 whitespace-pre">
            <a
              className="text-[#2B83F6] underline cursor-pointer"
              href={
                data.getIdea?.creatorId &&
                `/proplot/profile/${data.getIdea.creatorId}`
              }
            >
              {ens || shortAddress}
            </a>
            {` | ${
              creatorLilNoun === 1
                ? `${creatorLilNoun} lil noun`
                : `${creatorLilNoun} lil nouns`
            } | ${moment(data.getIdea.createdAt).format("MMM Do YYYY")} ${
              data.getIdea.closed ? "| closed" : ""
            }`}
          </div>

          <div className="mt-2 mb-2">
            <h3 className="text-2xl lodrina font-bold">
              {data?.getIdea?.comments?.filter((c: any) => !!c.deleted)?.length}{" "}
              {data?.getIdea?.comments?.filter((c: any) => !!c.deleted)
                ?.length === 1
                ? "comment"
                : "comments"}
            </h3>
          </div>

          <>
            {!data.getIdea.closed && (
              <CommentInput
                value={comment}
                setValue={setComment}
                hasTokens={hasTokens}
                onSubmit={submitComment}
              />
            )}
            <div className="mt-12 space-y-8">
              {data?.getIdea?.comments?.map((comment) => {
                return (
                  <Comment
                    comment={comment}
                    key={`comment-${comment.id}`}
                    hasTokens={hasTokens}
                    level={1}
                    isIdeaClosed={!!data.getIdea?.closed}
                  />
                );
              })}
            </div>
          </>
        </Col>
      </Row>
    </Container>
  );
};

export default IdeaPage;
