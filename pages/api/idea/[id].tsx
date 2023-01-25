import { useState, useEffect } from "react";
import { Col, Row, Container } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { createBrowserHistory } from "history";
import { useEthers } from "@usedapp/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleLeft } from "@fortawesome/free-solid-svg-icons";
// import { useReverseENSLookUp } from "@/utils/ensLookup";
import { useShortAddress } from "@/utils/addressAndENSDisplayUtils";
import {
  useIdeas,
  CommentFormData,
  Comment as CommentType,
} from "../../../hooks/useIdeas";
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
  const { id } = useParams() as { id: string };
  const history = createBrowserHistory();
  const { account } = useEthers();
  const { getComments, commentOnIdea } = useIdeas();
  const { comments, error } = getComments(id);
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
    getIdeaQuery({ variables: { ideaId: parseInt(id) } });
  }, []);

  const submitComment = async () => {
    await commentOnIdea({
      body: comment,
      ideaId: parseInt(id),
      authorId: account,
    } as CommentFormData);
    setComment("");
  };

  // loading
  if (!data?.getIdea) {
    return <div>loading</div>;
  }

  const tokenBalance = 10; // todo: replace
  const hasTokens = tokenBalance > 0;
  const creatorLilNoun = data.getIdea.votes?.find((vote) =>
    data.getIdea ? vote.voterId === data.getIdea.creatorId : false
  )?.voter?.lilnounCount;

  return (
    <Container fluid={"lg"}>
      <Row className="align-items-center">
        <Col lg={10} className="mx-auto">
          <Row>
            <div>
              <span
                className="cursor-pointer text-[#8C8D92] flex flex-row items-center"
                onClick={() => history.push("/proplot")}
              >
                <FontAwesomeIcon
                  icon={faArrowAltCircleLeft}
                  className={`mr-2 text-2xl cursor-pointer`}
                />
                <span className="text-lg lodrina">Back</span>
              </span>
            </div>
            <div className="flex flex-col mb-12">
              <div className="flex flex-row justify-between items-center">
                <h1 className="mb-0 lodrina">{data.getIdea.title}</h1>
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
            <span
              className="text-[#2B83F6] underline cursor-pointer"
              onClick={() => {
                data.getIdea?.creatorId &&
                  history.push(`/proplot/profile/${data.getIdea.creatorId}`);
              }}
            >
              {ens || shortAddress}
            </span>
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
              {comments.filter((c: any) => !!c.deleted)?.length}{" "}
              {comments.filter((c: any) => !!c.deleted)?.length === 1
                ? "comment"
                : "comments"}
            </h3>
          </div>

          {error ? (
            <div className="mt-12 mb-2">
              <h3 className="text-2xl lodrina font-bold">
                Failed to load commments
              </h3>
            </div>
          ) : (
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
                {comments?.map((comment) => {
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
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default IdeaPage;
