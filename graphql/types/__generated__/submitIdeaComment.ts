/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SubmitCommentInputOptions } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: submitIdeaComment
// ====================================================

export interface submitIdeaComment_submitIdeaComment_parent {
  __typename: "CommentParent";
  id: number;
  body: string;
}

export interface submitIdeaComment_submitIdeaComment {
  __typename: "Comment";
  id: number;
  body: string;
  parent: submitIdeaComment_submitIdeaComment_parent | null;
}

export interface submitIdeaComment {
  submitIdeaComment: submitIdeaComment_submitIdeaComment;
}

export interface submitIdeaCommentVariables {
  options: SubmitCommentInputOptions;
}
