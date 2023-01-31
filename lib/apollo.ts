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
  uri: 'https://api.thegraph.com/subgraphs/name/nounsdao/nouns-subgraph',
});

const lilNounsDAOLink = new HttpLink({
  uri: 'https://api.thegraph.com/subgraphs/name/lilnounsdao/lil-nouns-subgraph',
});

//pass them to apollo-client config
export const client = new ApolloClient({
  link: ApolloLink.split(
    operation => operation.getContext().clientName === 'NounsDAO',
    nounsDAOLink, //if above
    ApolloLink.split(
      operation => operation.getContext().clientName === 'LilNouns',
      lilNounsDAOLink,
      defaultLink,
    ),
  ),
  cache: new InMemoryCache(),
});