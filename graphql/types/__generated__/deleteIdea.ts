/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: deleteIdea
// ====================================================

export interface deleteIdea_deleteIdea {
  __typename: "DeleteDataResponse";
  id: number | null;
  success: boolean | null;
}

export interface deleteIdea {
  deleteIdea: deleteIdea_deleteIdea;
}

export interface deleteIdeaVariables {
  id: number;
}
