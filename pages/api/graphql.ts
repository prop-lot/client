import schema from "@/graphql/schemasMap";
import { withIronSessionApiRoute } from 'iron-session/next'
import { ironOptions } from '@/lib/config'

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';

const server = new ApolloServer({
  schema,
});

export default withIronSessionApiRoute(startServerAndCreateNextHandler(server, {
  context: async (req) => {
    return { 
      authScope: Boolean(req.session.user?.wallet) ? { user: req.session.user, isAuthorized: true } : { isAuthorized: false, user: {} },
      timeZone: req.headers['proplot-tz'] || 'UTC',
    }
  },
}), ironOptions)