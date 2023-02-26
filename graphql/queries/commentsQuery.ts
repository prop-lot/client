import { gql } from "@apollo/client";

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
