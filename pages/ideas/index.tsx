import IdeasHome from "@/components/IdeasHome";
import { GetServerSidePropsContext } from "next";
import { Community } from "@prisma/client";
import prisma from "@/lib/prisma";
import getCommunityByDomain from "@/utils/communityByDomain";

export const DEFAULT_HOMEPAGE_MATCH = "__NONE__";

const IdeasPage = ({
  community,
}: {
  community: Community & { data: { name: string; pfpUrl: string } };
}) => {
  return <IdeasHome community={community} />;
};

export default IdeasPage;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  let community;
  const { communityDomain } = getCommunityByDomain(context.req);

  if (communityDomain) {
    community = await prisma.community.findFirst({
      where: {
        uname: communityDomain,
      },
    });
  } else {
    return {
      notFound: true,
    };
  }

  if (!community) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      community: JSON.parse(JSON.stringify(community)),
    },
  };
}
