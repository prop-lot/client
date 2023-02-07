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
        deleted
        ideaId
        createdAt
        authorId
        replies {
          body
          id
          deleted
          parentId
          ideaId
          createdAt
          authorId
          replies {
            body
            id
            deleted
            parentId
            ideaId
            createdAt
            authorId
          }
        }
      }
      votes {
        id
        voterId
        ideaId
        direction
        voterWeight
        voter {
          wallet
        }
      }
    }
  }
`;
