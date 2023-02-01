import { DELEGATED_VOTES_BY_OWNER_SUB, TOTAL_NOUNS_CREATED } from '@/graphql/subgraph'
import { nounsGraphqlClient, lilNounsGraphqlClient } from '@/graphql/clients/nouns-graphql-client'

export const SupportedTokenGetterMap = {
  lilnouns: {
    type: 'LIL_NOUNS',
    getUserTokenCount: async (address: string) => {
      try {
        const data: any = await lilNounsGraphqlClient.query(DELEGATED_VOTES_BY_OWNER_SUB, { id: address.toLowerCase() }).toPromise()
        return data?.data?.delegate?.delegatedVotes || 0
      } catch(e) {
        throw new Error('Failed to fetch token count from subgraph')
      }
    },
    getTotalSupply: async () => {
      try {
        const data: any = await lilNounsGraphqlClient.query(TOTAL_NOUNS_CREATED, {}).toPromise()
        return data?.data?.governance?.delegatedVotes
      } catch(e) {
        throw new Error('Failed to fetch token supply from subgraph')
      }
    },
  },
  nouns: {
    type: 'NOUNS',
    getUserTokenCount: async (address: string) => {
      try {
        const data: any = await nounsGraphqlClient.query(DELEGATED_VOTES_BY_OWNER_SUB, { id: address.toLowerCase() }).toPromise()
        return data?.data?.delegate?.delegatedVotes || 0
      } catch(e) {
        throw new Error('Failed to fetch token count from subgraph')
      }
    },
    getTotalSupply: async () => {
      try {
        const data: any = await nounsGraphqlClient.query(TOTAL_NOUNS_CREATED, {}).toPromise()
        return data?.data?.governance?.delegatedVotes
      } catch(e) {
        throw new Error('Failed to fetch token supply from subgraph')
      }
    },
  }
}
