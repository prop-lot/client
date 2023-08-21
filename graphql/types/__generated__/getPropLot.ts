/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PropLotInputOptions, TagType, FilterType } from "./globalTypes";

// ====================================================
// GraphQL query operation: getPropLot
// ====================================================

export interface getPropLot_propLot_list_Comment {
  __typename: "Comment";
}

export interface getPropLot_propLot_list_Idea_ideaStats {
  __typename: "IdeaStats";
  comments: number | null;
}

export interface getPropLot_propLot_list_Idea_tags {
  __typename: "IdeaTags";
  type: TagType;
  label: string;
}

export interface getPropLot_propLot_list_Idea_votes_voter {
  __typename: "User";
  wallet: string;
}

export interface getPropLot_propLot_list_Idea_votes {
  __typename: "Vote";
  id: number;
  voterId: string;
  ideaId: number;
  direction: number;
  voterWeight: number;
  voter: getPropLot_propLot_list_Idea_votes_voter;
}

export interface getPropLot_propLot_list_Idea {
  __typename: "Idea";
  id: number;
  title: string;
  tldr: string;
  creatorId: string;
  description: string;
  votecount: number;
  createdAt: any;
  deleted: boolean;
  ideaStats: getPropLot_propLot_list_Idea_ideaStats | null;
  closed: boolean;
  consensus: number | null;
  tags: getPropLot_propLot_list_Idea_tags[] | null;
  votes: getPropLot_propLot_list_Idea_votes[] | null;
}

export type getPropLot_propLot_list = getPropLot_propLot_list_Comment | getPropLot_propLot_list_Idea;

export interface getPropLot_propLot_sortFilter_options {
  __typename: "FilterOption";
  id: string;
  label: string | null;
  selected: boolean;
  value: string;
  icon: string | null;
  count: number | null;
}

export interface getPropLot_propLot_sortFilter {
  __typename: "PropLotFilter";
  id: string;
  type: FilterType;
  label: string | null;
  options: getPropLot_propLot_sortFilter_options[];
}

export interface getPropLot_propLot_dateFilter_options {
  __typename: "FilterOption";
  id: string;
  label: string | null;
  selected: boolean;
  value: string;
  icon: string | null;
  count: number | null;
}

export interface getPropLot_propLot_dateFilter {
  __typename: "PropLotFilter";
  id: string;
  type: FilterType;
  label: string | null;
  options: getPropLot_propLot_dateFilter_options[];
}

export interface getPropLot_propLot_tagFilter_options {
  __typename: "FilterOption";
  id: string;
  label: string | null;
  selected: boolean;
  value: string;
  icon: string | null;
  count: number | null;
}

export interface getPropLot_propLot_tagFilter {
  __typename: "PropLotFilter";
  id: string;
  type: FilterType;
  label: string | null;
  options: getPropLot_propLot_tagFilter_options[];
}

export interface getPropLot_propLot_listFilter_options {
  __typename: "FilterOption";
  id: string;
  label: string | null;
  selected: boolean;
  value: string;
  icon: string | null;
  count: number | null;
}

export interface getPropLot_propLot_listFilter {
  __typename: "PropLotFilter";
  id: string;
  type: FilterType;
  label: string | null;
  options: getPropLot_propLot_listFilter_options[];
}

export interface getPropLot_propLot_appliedFilterTags {
  __typename: "AppliedFilter";
  param: string;
  displayName: string;
}

export interface getPropLot_propLot_metadata {
  __typename: "PropLotResponseMetadata";
  requestUUID: string;
  appliedFilters: string[] | null;
}

export interface getPropLot_propLot {
  __typename: "PropLotResponse";
  list: getPropLot_propLot_list[] | null;
  sortFilter: getPropLot_propLot_sortFilter | null;
  dateFilter: getPropLot_propLot_dateFilter | null;
  tagFilter: getPropLot_propLot_tagFilter | null;
  listFilter: getPropLot_propLot_listFilter | null;
  appliedFilterTags: getPropLot_propLot_appliedFilterTags[] | null;
  metadata: getPropLot_propLot_metadata;
}

export interface getPropLot {
  propLot: getPropLot_propLot;
}

export interface getPropLotVariables {
  options: PropLotInputOptions;
}
