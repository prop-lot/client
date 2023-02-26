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

export const GET_IDEA_COMMENTS = gql`
  query getIdeaComments($ideaId: Int!) {
    getIdeaComments(options: { ideaId: $ideaId }) {
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
  }
`;
