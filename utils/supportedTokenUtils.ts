import { DELEGATED_VOTES_BY_OWNER_SUB, DELEGATED_VOTES_BY_OWNER_SUB_AT_BLOCK, TOTAL_NOUNS_CREATED } from '@/graphql/subgraph'
import { nounsGraphqlClient, lilNounsGraphqlClient } from '@/graphql/clients/nouns-graphql-client'

export const SupportedTokenGetterMap = {
  lilnouns: {
    type: 'LIL_NOUNS',
    getUserTokenCount: async (address: string) => {
      try {
        const data: any = await lilNounsGraphqlClient.query(DELEGATED_VOTES_BY_OWNER_SUB, { id: address.toLowerCase() }).toPromise()
        return parseInt(data?.data?.delegate?.delegatedVotes) || 0
      } catch(e) {
        throw new Error('Failed to fetch token count from subgraph')
      }
    },
    getTotalSupply: async () => {
      try {
        const data: any = await lilNounsGraphqlClient.query(TOTAL_NOUNS_CREATED, {}).toPromise()
        return parseInt(data?.data?.governance?.delegatedVotes) || undefined
      } catch(e) {
        throw new Error('Failed to fetch token supply from subgraph')
      }
    },
    getUserVoteWeightAtBlock: async (address: string, blockNumber: number) => {
      try {
        const data: any = await lilNounsGraphqlClient.query(DELEGATED_VOTES_BY_OWNER_SUB_AT_BLOCK, { id: address.toLowerCase(), block: { number: blockNumber } }).toPromise()
        return parseInt(data?.data?.delegate?.delegatedVotes) || 0
      } catch(e) {
        throw new Error('Failed to fetch token count from subgraph')
      }
    }
  },
  nouns: {
    type: 'NOUNS',
    getUserTokenCount: async (address: string) => {
      try {
        const data: any = await nounsGraphqlClient.query(DELEGATED_VOTES_BY_OWNER_SUB, { id: address.toLowerCase() }).toPromise()
        return parseInt(data?.data?.delegate?.delegatedVotes) || 0
      } catch(e) {
        throw new Error('Failed to fetch token count from subgraph')
      }
    },
    getTotalSupply: async () => {
      try {
        const data: any = await nounsGraphqlClient.query(TOTAL_NOUNS_CREATED, {}).toPromise()
        return parseInt(data?.data?.governance?.delegatedVotes) || undefined
      } catch(e) {
        throw new Error('Failed to fetch token supply from subgraph')
      }
    },
    getUserVoteWeightAtBlock: async (address: string, blockNumber: number) => {
      try {
        const data: any = await nounsGraphqlClient.query(DELEGATED_VOTES_BY_OWNER_SUB_AT_BLOCK, { id: address.toLowerCase(), block: { number: blockNumber } }).toPromise()
        return parseInt(data?.data?.delegate?.delegatedVotes) || 0
      } catch(e) {
        throw new Error('Failed to fetch token count from subgraph')
      }
    }
  }
}
