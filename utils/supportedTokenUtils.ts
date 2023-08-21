import moment from 'moment';

import { DELEGATED_VOTES_BY_OWNER_SUB, DELEGATED_VOTES_BY_OWNER_SUB_AT_BLOCK, GET_CURRENT_AUCTION, GET_PREVIOUS_AUCTIONS, GET_RECENT_PROPOSALS, TOTAL_NOUNS_CREATED, GET_GOVERNANCE_DATA } from '@/graphql/subgraph'
import { nounsGraphqlClient, lilNounsGraphqlClient } from '@/graphql/clients/nouns-graphql-client'

// Extend this with subdomains for other DAOs that we want to integrate.
export enum SUPPORTED_SUBDOMAINS {
  LIL_NOUNS = 'lilnouns',
  NOUNS = 'nouns'
}

export const SupportedTokenGetterMap = {
  [SUPPORTED_SUBDOMAINS.LIL_NOUNS]: {
    account: "",
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
    },
    getCurrentAuction: async () => {
      try {
        const data: any = await lilNounsGraphqlClient.query(GET_CURRENT_AUCTION, {}).toPromise()
        return data?.data?.auctions?.[0]
      } catch(e) {
        throw new Error('Failed to fetch current auction from subgraph')
      }
    },
    getPreviousAuctions: async (nounIds: number[]) => {
      try {
        const data: any = await lilNounsGraphqlClient.query(GET_PREVIOUS_AUCTIONS, { nounIds }).toPromise()
        return data?.data?.auctions
      } catch(e) {
        throw new Error('Failed to fetch current auction from subgraph')
      }
    },
    getRecentProposals: async () => {
      try {
        const sixWeeksAgo = moment().subtract(6, 'weeks');
        const recentTimestamp = sixWeeksAgo.unix();
        const data: any = await lilNounsGraphqlClient.query(GET_RECENT_PROPOSALS, { recentTimestamp }).toPromise()
        return data?.data?.proposals
      } catch(e) {
        throw new Error('Failed to fetch recent proposals from subgraph')
      }
    },
    getGovernanceData: async () => {
      try {
        const data: any = await lilNounsGraphqlClient.query(GET_GOVERNANCE_DATA, { }).toPromise()
        return data?.data?.governance
      } catch(e) {
        throw new Error('Failed to fetch governance data from subgraph')
      }
    },
  },
  [SUPPORTED_SUBDOMAINS.NOUNS]: {
    account: "0x0bc3807ec262cb779b38d65b38158acc3bfede10",
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
    },
    getCurrentAuction: async () => {
      try {
        const data: any = await nounsGraphqlClient.query(GET_CURRENT_AUCTION, {}).toPromise()
        return data?.data?.auctions?.[0]
      } catch(e) {
        throw new Error('Failed to fetch current auction from subgraph')
      }
    },
    getPreviousAuctions: async (nounIds: number[]) => {
      try {
        const data: any = await nounsGraphqlClient.query(GET_PREVIOUS_AUCTIONS, { nounIds }).toPromise()
        return data?.data?.auctions
      } catch(e) {
        throw new Error('Failed to fetch current auction from subgraph')
      }
    },
    getRecentProposals: async () => {
      try {
        const sixWeeksAgo = moment().subtract(6, 'weeks');
        const recentTimestamp = sixWeeksAgo.unix();
        const data: any = await nounsGraphqlClient.query(GET_RECENT_PROPOSALS, { recentTimestamp }).toPromise()
        return data?.data?.proposals
      } catch(e) {
        throw new Error('Failed to fetch recent proposals from subgraph')
      }
    },
    getGovernanceData: async () => {
      try {
        const data: any = await nounsGraphqlClient.query(GET_GOVERNANCE_DATA, { }).toPromise()
        return data?.data?.governance
      } catch(e) {
        throw new Error('Failed to fetch governance data from subgraph')
      }
    },
  }
}
