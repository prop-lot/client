import { gql } from "@apollo/client";

export const GET_IDEA_QUERY = gql`
  query getIdea($ideaId: Int!) {
    getIdea(options: { ideaId: $ideaId }) {
      id
      title
      tldr
      creatorId
      description
      votecount
      createdAt
      deleted
      ideaStats {
        comments
      }
      closed
      consensus
      tags {
        type
        label
      }
      comments {
        body
        id
        parentId
        ideaId
        replies {
          body
          id
          parentId
          ideaId
          replies {
            body
            id
            parentId
            ideaId
          }
        }
      }
      votes {
        id
        voterId
        ideaId
        direction
        voter {
          wallet
          lilnounCount
        }
      }
    }
  }
`;
