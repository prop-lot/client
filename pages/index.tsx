import LandingPage from "@/components/LandingPage";
import CommunityHome from "@/components/CommunityHome";
import { GetServerSidePropsContext } from "next";
import { Community } from "@prisma/client";
import prisma from "@/lib/prisma";
import getCommunityByDomain from "@/utils/communityByDomain";

export const DEFAULT_HOMEPAGE_MATCH = "__NONE__";

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

export default Home;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  let community;
  const { communityDomain } = getCommunityByDomain(context.req);

  if (communityDomain) {
    community = await prisma.community.findFirst({
      where: {
        uname: communityDomain,
      },
    });
  }

  // If there isn't a community then redirect to the landing page
  const communityName = !community ? DEFAULT_HOMEPAGE_MATCH : communityDomain

  // 1. communityDomain and no community = __NONE__ show placeholder
  // 2. communityDomain and community = correct community to show
  // 3. communityDomain but no community = there was a subdomain, but it doesn't exist (probably can't happen)

  return {
    props: {
      communityName,
      community: community ? JSON.parse(JSON.stringify(community)) : null,
    },
  };
}
