import { SUPPORTED_SUBDOMAINS } from "@/utils/supportedTokenUtils";
import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";

const defaultLink = new HttpLink({
  uri: "/api/graphql",
});

const nounsDAOLink = new HttpLink({
  uri: 'https://api.goldsky.com/api/public/project_cldf2o9pqagp43svvbk5u3kmo/subgraphs/nouns/0.1.0/gn',
});

const lilNounsDAOLink = new HttpLink({
  uri: 'https://api.thegraph.com/subgraphs/name/lilnounsdao/lil-nouns-subgraph',
});

//pass them to apollo-client config
export const client = new ApolloClient({
  link: ApolloLink.split(
    operation => operation.getContext().clientName === SUPPORTED_SUBDOMAINS.NOUNS,
    nounsDAOLink, //if above
    ApolloLink.split(
      operation => operation.getContext().clientName === SUPPORTED_SUBDOMAINS.LIL_NOUNS,
      lilNounsDAOLink,
      defaultLink,
    ),
  ),
  cache: new InMemoryCache(),
});