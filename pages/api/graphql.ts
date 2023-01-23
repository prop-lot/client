import { createYoga } from "graphql-yoga";
import type { NextApiRequest, NextApiResponse } from "next";
import schema from "@/graphql/schemasMap";

export default createYoga<{
  req: NextApiRequest;
  res: NextApiResponse;
}>({
  schema: schema,
  graphqlEndpoint: "/api/graphql",
});

export const config = {
  api: {
    bodyParser: false,
  },
};
