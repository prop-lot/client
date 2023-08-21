/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TagType } from "./globalTypes";

// ====================================================
// GraphQL query operation: getTags
// ====================================================

export interface getTags_tags {
  __typename: "IdeaTags";
  label: string;
  type: TagType;
}

export interface getTags {
  tags: getTags_tags[] | null;
}
