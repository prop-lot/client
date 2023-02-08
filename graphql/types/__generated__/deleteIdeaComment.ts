/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: deleteIdeaComment
// ====================================================

export interface deleteIdeaComment_deleteIdeaComment_replies_replies {
  __typename: "Comment";
  body: string;
  id: number;
  deleted: boolean;
  authorId: string;
  parentId: number | null;
  ideaId: number;
  createdAt: any;
}

export interface deleteIdeaComment_deleteIdeaComment_replies {
  __typename: "Comment";
  body: string;
  id: number;
  deleted: boolean;
  authorId: string;
  parentId: number | null;
  ideaId: number;
  createdAt: any;
  replies: deleteIdeaComment_deleteIdeaComment_replies_replies[] | null;
}

export interface deleteIdeaComment_deleteIdeaComment {
  __typename: "Comment";
  body: string;
  authorId: string;
  deleted: boolean;
  id: number;
  parentId: number | null;
  ideaId: number;
  createdAt: any;
  replies: deleteIdeaComment_deleteIdeaComment_replies[] | null;
}

export interface deleteIdeaComment {
  deleteIdeaComment: deleteIdeaComment_deleteIdeaComment;
}

export interface deleteIdeaCommentVariables {
  id: number;
}
