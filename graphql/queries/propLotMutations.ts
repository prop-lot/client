import { gql } from "@apollo/client";

export const SUBMIT_VOTE_MUTATION = gql`
  mutation submitIdeaVote($options: SubmitVoteInputOptions!) {
    submitIdeaVote(options: $options) {
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
`;

export const SUBMIT_IDEA_MUTATION = gql`
  mutation submitIdea($options: SubmitIdeaInputOptions!) {
    submitIdea(options: $options) {
      id
    }
  }
`;

export const SUBMIT_COMMENT_MUTATION = gql`
  mutation submitIdeaComment($options: SubmitCommentInputOptions!) {
    submitIdeaComment(options: $options) {
      id
      body
      parent {
        id
        body
      }
    }
  }
`;

export const DELETE_IDEA_COMMENT_MUTATION = gql`
  mutation deleteIdeaComment($id: Int!) {
    deleteIdeaComment(id: $id) {
      body
      authorId
      deleted
      id
      parentId
      ideaId
      createdAt
      replies {
        body
        id
        deleted
        authorId
        parentId
        ideaId
        createdAt
        replies {
          body
          id
          deleted
          authorId
          parentId
          ideaId
          createdAt
        }
      }
    }
  }
`;

export const DELETE_IDEA__MUTATION = gql`
  mutation deleteIdea($id: Int!) {
    deleteIdea(id: $id) {
      id
      success
    }
  }
`;