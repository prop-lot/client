import CommunityHome from "@/components/CommunityHome";
import { GetServerSidePropsContext } from "next";
import { Community } from "@prisma/client";
import LandingPage from "@/components/LandingPage";

const DEFAULT_HOMEPAGE_MATCH = "__NONE__";

const Home = ({
  communityName,
  community,
}: {
  communityName: string;
  community: Community;
}) => {
  if (communityName === DEFAULT_HOMEPAGE_MATCH) {
    return <LandingPage />;
  }

  return <CommunityHome community={community} />;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  let communityName;
  let community;
  const host = context.req.headers.host;
  const subdomain =
    process.env.NODE_ENV === "development"
      ? host?.match(/(.*)\.localhost:3000/)
      : host?.match(/(.*)\.proplot\.wtf/);

  if (!subdomain) {
    communityName = DEFAULT_HOMEPAGE_MATCH;
  } else {
    communityName = subdomain[1];
    community = await prisma.community.findFirst({
      where: {
        name: communityName,
      },
    });
  }

  // 1. communityName and no community = __NONE__ show placeholder
  // 2. communityName and community = correct community to show
  // 3. communityName but no community = there was a subdomain, but it doesn't exist (probably can't happen)

  return {
    props: {
      communityName,
      community: community ? JSON.parse(JSON.stringify(community)) : null,
    },
  };
}

export default Home;
