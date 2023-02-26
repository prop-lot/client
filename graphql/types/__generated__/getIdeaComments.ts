/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getIdeaComments
// ====================================================

export interface getIdeaComments_getIdeaComments_replies_replies {
  __typename: "Comment";
  body: string;
  id: number;
  deleted: boolean;
  parentId: number | null;
  ideaId: number;
  createdAt: any;
  authorId: string;
}

export interface getIdeaComments_getIdeaComments_replies {
  __typename: "Comment";
  body: string;
  id: number;
  deleted: boolean;
  parentId: number | null;
  ideaId: number;
  createdAt: any;
  authorId: string;
  replies: getIdeaComments_getIdeaComments_replies_replies[] | null;
}

export interface getIdeaComments_getIdeaComments {
  __typename: "Comment";
  body: string;
  id: number;
  parentId: number | null;
  deleted: boolean;
  ideaId: number;
  createdAt: any;
  authorId: string;
  replies: getIdeaComments_getIdeaComments_replies[] | null;
}

export interface getIdeaComments {
  getIdeaComments: getIdeaComments_getIdeaComments[] | null;
}

export interface getIdeaCommentsVariables {
  ideaId: number;
}
