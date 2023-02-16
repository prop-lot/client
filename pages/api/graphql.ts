import schema from "@/graphql/schemasMap";
import { withIronSessionApiRoute } from "iron-session/next";
import { ironOptions } from "@/lib/config";

import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { SUPPORTED_SUBDOMAINS, SupportedTokenGetterMap } from "@/utils/supportedTokenUtils";
import getCommunityByDomain from "@/utils/communityByDomain";

// @ts-ignore
const server = new ApolloServer({
  schema,
});

export default withIronSessionApiRoute(
  startServerAndCreateNextHandler(server, {
    context: async (req) => {
      const { communityDomain, supportedTokenConfig } = getCommunityByDomain(req);

      // We could avoid doing this lookup and just hardcode the community id in
      // the supportedTokenConfig for each community but this is a bit more
      // correct.
      const community = await prisma.community.findFirst({
        where: {
          uname: communityDomain,
        },
      });

      // If there is no subdomain then don't throw an error here as we're on
      // proplot.wtf and may want to handle API calls differently.
      if (communityDomain && !supportedTokenConfig) {
        throw new Error('This community does not exist');
      }

      return {
        authScope: Boolean(req.session.user?.wallet)
          ? { user: req.session.user, isAuthorized: true }
          : { isAuthorized: false, user: {} },
        timeZone: req.headers["proplot-tz"] || "UTC",
        communityId: community?.id,
        communityTokenConfig: supportedTokenConfig,
      };
    },
  }),
  ironOptions
);
