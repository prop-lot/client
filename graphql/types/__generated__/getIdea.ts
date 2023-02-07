/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TagType } from "./globalTypes";

// ====================================================
// GraphQL query operation: getIdea
// ====================================================

export interface getIdea_getIdea_ideaStats {
  __typename: "IdeaStats";
  comments: number | null;
}

export interface getIdea_getIdea_tags {
  __typename: "IdeaTags";
  type: TagType;
  label: string;
}

export interface getIdea_getIdea_comments_replies_replies {
  __typename: "Comment";
  body: string;
  id: number;
  deleted: boolean;
  parentId: number | null;
  ideaId: number;
  createdAt: any;
  authorId: string;
}

export interface getIdea_getIdea_comments_replies {
  __typename: "Comment";
  body: string;
  id: number;
  deleted: boolean;
  parentId: number | null;
  ideaId: number;
  createdAt: any;
  authorId: string;
  replies: getIdea_getIdea_comments_replies_replies[] | null;
}

export interface getIdea_getIdea_comments {
  __typename: "Comment";
  body: string;
  id: number;
  parentId: number | null;
  deleted: boolean;
  ideaId: number;
  createdAt: any;
  authorId: string;
  replies: getIdea_getIdea_comments_replies[] | null;
}

export interface getIdea_getIdea_votes_voter {
  __typename: "User";
  wallet: string;
}

export interface getIdea_getIdea_votes {
  __typename: "Vote";
  id: number;
  voterId: string;
  ideaId: number;
  direction: number;
  voterWeight: number;
  voter: getIdea_getIdea_votes_voter;
}

export interface getIdea_getIdea {
  __typename: "Idea";
  id: number;
  title: string;
  tldr: string;
  creatorId: string;
  description: string;
  votecount: number;
  createdAt: any;
  deleted: boolean;
  ideaStats: getIdea_getIdea_ideaStats | null;
  closed: boolean;
  consensus: number | null;
  tags: getIdea_getIdea_tags[] | null;
  comments: getIdea_getIdea_comments[] | null;
  votes: getIdea_getIdea_votes[] | null;
}

export interface getIdea {
  getIdea: getIdea_getIdea | null;
}

export interface getIdeaVariables {
  ideaId: number;
}
