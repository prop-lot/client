/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum FilterType {
  MULTI_SELECT = "MULTI_SELECT",
  SINGLE_SELECT = "SINGLE_SELECT",
}

export enum TagType {
  ARCHIVED = "ARCHIVED",
  CLOSED = "CLOSED",
  COMMUNITY = "COMMUNITY",
  CONSENSUS = "CONSENSUS",
  CREATIVE = "CREATIVE",
  DISCUSSION = "DISCUSSION",
  GOVERNANCE = "GOVERNANCE",
  HARDWARE = "HARDWARE",
  INFO = "INFO",
  NEW = "NEW",
  OTHER = "OTHER",
  PUBLIC_GOOD = "PUBLIC_GOOD",
  SOFTWARE = "SOFTWARE",
}

export interface PropLotInputOptions {
  filters?: string[] | null;
  requestUUID: string;
}

export interface PropLotProfileInputOptions {
  filters?: string[] | null;
  wallet: string;
  requestUUID: string;
}

export interface SubmitCommentInputOptions {
  ideaId: number;
  body: string;
  parentId?: number | null;
}

export interface SubmitIdeaInputOptions {
  title: string;
  tldr: string;
  description: string;
  tags?: TagType[] | null;
}

export interface SubmitVoteInputOptions {
  direction: number;
  ideaId: number;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
