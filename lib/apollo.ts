import { ApolloClient, InMemoryCache } from "@apollo/client";

export const client = new ApolloClient({
  uri:
    process.env.NODE_ENV === "development"
      ? `http://localhost:3000/api/graphql`
      : `https://proplot-client-staging.fly.dev/api/graphql`,
  cache: new InMemoryCache(),
});
