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
