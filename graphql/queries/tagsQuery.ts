import { gql } from "@apollo/client";

export const GET_TAGS = gql`
  query getTags {
    tags: getTags {
      label
      type
    }
  }
`;
