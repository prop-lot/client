import { gql } from "@apollo/client";

export const GET_PROPLOT_QUERY = gql`
  query getPropLot($options: PropLotInputOptions!) {
    propLot: getPropLot(options: $options) {
      list {
        ... on Idea {
          id
          title
          tldr
          creatorId
          description
          votecount
          createdAt
          deleted
          ideaStats {
            comments
          }
          closed
          consensus
          tags {
            type
            label
          }
          votes {
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
      }
      sortFilter {
        ...filterProperties
      }
      dateFilter {
        ...filterProperties
      }
      tagFilter {
        ...filterProperties
      }
      listFilter {
        ...filterProperties
      }
      appliedFilterTags {
        param
        displayName
      }
      metadata {
        requestUUID
        appliedFilters
      }
    }
  }

  fragment filterProperties on PropLotFilter {
    id
    type
    label
    options {
      id
      label
      selected
      value
      icon
      count
    }
  }
`;
