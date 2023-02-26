import { useEffect } from "react";
import { Col, Row, Container } from "react-bootstrap";
import { useRouter } from "next/router";
import { useAccount, useEnsName } from "wagmi";
import { useShortAddress } from "@/utils/addressAndENSDisplayUtils";
import moment from "moment";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import { getIdea } from "@/graphql/types/__generated__/getIdea";
import { useLazyQuery, ApolloQueryResult } from "@apollo/client";
import { GET_IDEA_QUERY } from "@/graphql/queries/ideaQuery";
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

  const [getDelegatedVotes, { data: getDelegatedVotesData }] = useLazyQuery(
    DELEGATED_VOTES_BY_OWNER_SUB,
    {
      context: {
        clientName: community?.uname as SUPPORTED_SUBDOMAINS,
      },
    }
  );

  const { data: creatorEns } = useEnsName({
    address: data?.getIdea?.creatorId as `0x${string}`,
    cacheTime: 6_000,
  });
  const shortAddress = useShortAddress(data?.getIdea?.creatorId || "");

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

  return (
    <Container fluid={"lg"} className="mt-8 mb-12">
      <Row className="align-items-center">
        <Col lg={10} className="mx-auto">
          <Row>
            <Link
              className="cursor-pointer text-[#8C8D92] flex flex-row items-center"
              href="/"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 mr-2 cursor-pointer"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-4.28 9.22a.75.75 0 000 1.06l3 3a.75.75 0 101.06-1.06l-1.72-1.72h5.69a.75.75 0 000-1.5h-5.69l1.72-1.72a.75.75 0 00-1.06-1.06l-3 3z"
                  clipRule="evenodd"
                />
              </svg>

              <span className="text-lg lodrina">Back</span>
            </Link>

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
                  {data.getIdea.tags.map((tag, idx) => {
                    return (
                      <span
                        key={tag.label}
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
                className="prose lg:prose-xl"
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
                data.getIdea?.creatorId && `/profile/${data.getIdea.creatorId}`
              }
            >
              {creatorEns || shortAddress}
            </a>
            {` | ${
              creatorTokenWeight === 1
                ? `${creatorTokenWeight} token`
                : `${creatorTokenWeight} tokens`
            } | ${moment(data.getIdea.createdAt).format("MMM Do YYYY")} ${
              data.getIdea.closed ? "| closed" : ""
            }`}
          </div>

          <div className="mt-2 mb-2">
            <h3 className="text-2xl lodrina font-bold">
              {
                // @ts-ignore
                data?.getIdea?.comments?.filter((c: any) => !!c.deleted)?.length
              }{" "}
              {
                // @ts-ignore
                data?.getIdea?.comments?.filter((c: any) => !!c.deleted)
                  ?.length === 1
                  ? "comment"
                  : "comments"
              }
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
            <div className="mt-12 space-y-8">
              {
                // @ts-ignore
                data?.getIdea?.comments?.map((comment: any) => {
                  return (
                    <Comment
                      comment={comment}
                      key={`comment-${comment.id}`}
                      hasTokens={hasTokens}
                      level={1}
                      isIdeaClosed={!!data.getIdea?.closed}
                    />
                  );
                })
              }
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
