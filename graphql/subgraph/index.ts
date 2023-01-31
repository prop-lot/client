import { gql } from '@apollo/client';

export const NOUNS_BY_OWNER_SUB = gql`
  query account($id: String! ) {
    account(id: $id) {
      id
      nouns {
        id
        seed {
          background
          body
          accessory
          head
          glasses
        }
      }
    }
  }
`;

export const NOUNS_BY_OWNER_SUB_AT_BLOCK = gql`
  query account($id: String!, $block: Number! ) {
    account(id: $id, block: { number: $block }) {
      id
      nouns {
        id
      }
    }
  }
`;
