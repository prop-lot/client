import { ApolloClient, InMemoryCache } from "@apollo/client";

// we might actually be able to just do something like /api/graphql and it will pickup on the host
export const client = new ApolloClient({
  uri: `/api/graphql`,
  cache: new InMemoryCache(),
});
