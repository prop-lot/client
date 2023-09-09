import { gql } from '@apollo/client';

export const DELEGATED_VOTES_BY_OWNER_SUB = gql`
  query delegate($id: String!) {
    delegate(id: $id) {
      delegatedVotes
    }
  }
`;

export const DELEGATED_VOTES_BY_OWNER_SUB_AT_BLOCK = gql`
  query delegate($id: String!, $block: Block_height ) {
    delegate(id: $id, block: $block) {
      delegatedVotes
    }
  }
`;

export const TOKEN_BALANCES_BY_OWNER_SUB = gql`
  query tokenBalances($id: String!) {
    delegate(id: $id) {
      delegatedVotes
    }

    account(id: $id) {
      tokenBalance
      tokens: nouns {
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

// delegatedVotes is equal to the number of votes available to participate in voting.
// this count will exclude burnt tokens.
export const TOTAL_NOUNS_CREATED = gql`
{
  governance(id: "GOVERNANCE") {
    delegatedVotes
  }
}
`;

export const GET_CURRENT_AUCTION = gql`
{
  auctions(where: { settled_not: true}) {
    id
    noun {
      id
      seed {
        id
        background
        body
        accessory
        head
        glasses
      }
    }
    amount
  }
}
`

export const GET_PREVIOUS_AUCTIONS = gql`
query getPreviousAuctions($nounIds: [ID!]!) {
  auctions(orderDirection: desc, orderBy: id, where: {
    noun_: {
      id_in: $nounIds
    }
  }){
    id
    noun {
      id
      seed {
        id
        background
        body
        accessory
        head
        glasses
      }
    }
    amount
  }
}
`

export const GET_RECENT_PROPOSALS = gql`
query getRecentProposals($recentTimestamp: Int!) {
  proposals(where: { createdTimestamp_gt: $recentTimestamp }, orderBy: id, orderDirection: desc){
    id
    title
    status
  }
}
`

export const GET_GOVERNANCE_DATA = gql`
{
  governance(id: "GOVERNANCE") {
    currentTokenHolders
    delegatedVotes
  }
}
`
