import { useEffect, useState } from "react";
import { Col, Row, Container } from "react-bootstrap";
import { useRouter } from "next/router";
import { useAccount, useEnsName } from "wagmi";
import { useShortAddress } from "@/utils/addressAndENSDisplayUtils";
import moment from "moment";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import { getIdea } from "@/graphql/types/__generated__/getIdea";
import { getIdeaComments } from "@/graphql/types/__generated__/getIdeaComments";
import { useLazyQuery, ApolloQueryResult } from "@apollo/client";
import { GET_IDEA_QUERY } from "@/graphql/queries/ideaQuery";
import { GET_IDEA_COMMENTS } from "@/graphql/queries/commentsQuery";
import { virtualTagColorMap } from "@/utils/virtualTagColors";
import IdeaVoteControls from "@/components/IdeaVoteControls";
import Comment from "@/components/Comment";
import CommentInput from "@/components/CommentInput";
import Link from "next/link";
import { DELEGATED_VOTES_BY_OWNER_SUB } from "@/graphql/subgraph";
import { GetServerSidePropsContext } from "next";
import prisma from "@/lib/prisma";
import { Community } from "@prisma/client";
import { SUPPORTED_SUBDOMAINS } from "@/utils/supportedTokenUtils";
import getCommunityByDomain from "@/utils/communityByDomain";
import { client } from "@/lib/apollo";

const renderer = new marked.Renderer();
const linkRenderer = renderer.link;
renderer.link = (href: string, title: string, text: string) => {
  const html = linkRenderer.call(renderer, href, title, text);
  return html.replace(
    /^<a /,
    `<a target="_blank" rel="noreferrer noopener nofollow" `
  );
};

marked.setOptions({
  renderer: renderer,
});

const ProfileLink = ({ id }: { id: string }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: creatorEns } = useEnsName({
    address: id as `0x${string}`,
    cacheTime: 6_000,
    onError: (err) => {
      console.log(err);
    },
  });
  const shortAddress = useShortAddress(id);

  const profileName = creatorEns || shortAddress;

  return (
    <a
      className="text-[#2B83F6] underline cursor-pointer"
      href={`/profile/${id}`}
    >
      {isMounted && profileName}
    </a>
  );
};

const IdeaPage = ({
  community,
  data,
}: {
  community: Community;
  data: getIdea;
}) => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { address } = useAccount();

  const [getIdeaCommentsQuery, { data: commentData }] =
  useLazyQuery<getIdeaComments>(GET_IDEA_COMMENTS, {
    context: {
      clientName: "PropLot",
      headers: {
        "proplot-tz": Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    },
  });

  const [getDelegatedVotes, { data: getDelegatedVotesData }] = useLazyQuery(
    DELEGATED_VOTES_BY_OWNER_SUB,
    {
      context: {
        clientName: community?.uname as SUPPORTED_SUBDOMAINS,
      },
    }
  );

  useEffect(() => {
    if (data.getIdea?.id) {
      getIdeaCommentsQuery({
        variables: { ideaId: data.getIdea?.id },
      });
    }
  }, [getIdeaCommentsQuery, data.getIdea?.id]);

  useEffect(() => {
    if (address) {
      getDelegatedVotes({
        variables: {
          id: address.toLowerCase(),
        },
      });
    }
  }, [address, getDelegatedVotes]);

  // loading
  // todo: skeleton loading for better experience
  if (!data?.getIdea) {
    return <></>;
  }

  const tokenBalance = getDelegatedVotesData?.delegate?.delegatedVotes || 0; // todo: replace
  const hasTokens = tokenBalance > 0;
  const creatorTokenWeight = data.getIdea.votes?.find(
    (vote) => vote.voterId === data.getIdea?.creatorId
  )?.voterWeight;
  const commentCount = commentData?.getIdeaComments?.filter((c: any) => !c.deleted)
  ?.length;

  return (
    <Container fluid={"lg"} className="mt-xl mb-xl">
      <Row className="align-items-center">
        <Col lg={10} className="mx-auto">
          <Row>
            <Link
              className="cursor-pointer text-dark-grey flex flex-row items-center"
              href="/"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-[24px] h-[24px] mr-sm cursor-pointer"
                >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-4.28 9.22a.75.75 0 000 1.06l3 3a.75.75 0 101.06-1.06l-1.72-1.72h5.69a.75.75 0 000-1.5h-5.69l1.72-1.72a.75.75 0 00-1.06-1.06l-3 3z"
                  clipRule="evenodd"
                />
              </svg>

              <span className="text-lg lodrina">Back</span>
            </Link>

            <div className="flex flex-col mb-lg">
              <div className="flex flex-row justify-between items-center">
                <h1 className="mb-0 lodrina text-xxl self-end">
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
                <div className="flex flex-row gap-sm mt-lg flex-wrap">
                  {data.getIdea.tags.map((tag) => {
                    return (
                      <span
                        key={tag.label}
                        className={`${
                          virtualTagColorMap[tag.type]?.colors ||
                          "text-white bg-blue"
                        } text-xs font-bold rounded-[8px] px-sm py-xs flex`}
                      >
                        {tag.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </Row>
          <div className="space-y-xl">
            <div className="flex flex-col">
              <h3 className="lodrina font-bold text-xl mb-sm">tl:dr</h3>
              <p>{data.getIdea.tldr}</p>
            </div>
            <div className="flex flex-col">
              <h3 className="lodrina font-bold text-xl mb-sm">Description</h3>
              <div
                className="prose-base"
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

          <div className="flex flex-1 font-bold text-sm text-dark-grey mt-xl whitespace-pre">
            {data.getIdea.creatorId && (
              <ProfileLink id={data.getIdea.creatorId} />
            )}
            {` | ${
              creatorTokenWeight === 1
                ? `${creatorTokenWeight} token`
                : `${creatorTokenWeight} tokens`
            } | ${moment(data.getIdea.createdAt).format("MMM Do YYYY")} ${
              data.getIdea.closed ? "| closed" : ""
            }`}
          </div>

          <div className="mt-sm mb-sm">
            <h3 className="text-xl lodrina font-bold">
              {commentCount}{" "}
              {commentCount === 1
                ? "comment"
                : "comments"}
            </h3>
          </div>

          <>
            {!data.getIdea.closed && (
              <CommentInput
                hasTokens={hasTokens}
                ideaId={Number(id)}
                parentId={undefined}
              />
            )}
            <div className="mt-xl space-y-xl">
              {commentData?.getIdeaComments?.map((comment: any) => {
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

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { communityDomain } = getCommunityByDomain(context.req);

  if (!communityDomain) {
    return {
      notFound: true,
    };
  }

  const community = await prisma.community.findFirst({
    where: {
      uname: communityDomain,
    },
  });

  if (!community || !context.params?.id) {
    return {
      notFound: true,
    };
  }

  try {
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const host = context.req.headers.host;
    // We set a different uri locally as routing to subdomains here doesn't work unless you add 127.0.0.1 lilnouns.localhost to your /etc/hosts
    // we could add that as a requirement to the readme but this also works.
    const uri =
      process.env.NODE_ENV === "development"
        ? `http://localhost:3000/api/graphql`
        : `${protocol}://${host}/api/graphql`;

    const ideaData: ApolloQueryResult<getIdea> = await client.query({
      query: GET_IDEA_QUERY,
      variables: { ideaId: parseInt(context.params.id as string, 10) },
      fetchPolicy: "no-cache",
      context: {
        clientName: "PropLot",
        uri,
        headers: {
          "proplot-cd": communityDomain, // Used for local dev as this query doesn't run on the subdomain
          "proplot-tz": Intl.DateTimeFormat().resolvedOptions().timeZone,
          Cookie: context.req.headers.cookie || "",
        },
      },
    });

    return {
      props: {
        community: JSON.parse(JSON.stringify(community)),
        data: ideaData.data,
      },
    };
  } catch (e) {
    console.log(e);
    return {
      notFound: true,
    };
  }
}

export default IdeaPage;
