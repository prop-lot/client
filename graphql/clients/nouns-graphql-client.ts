import { createClient } from 'urql'

const LILNOUNSAPIURL = 'https://api.thegraph.com/subgraphs/name/lilnounsdao/lil-nouns-subgraph'
const NOUNSAPIURL = 'https://api.thegraph.com/subgraphs/name/nounsdao/nouns-subgraph'

export const lilNounsGraphqlClient = createClient({
  url: LILNOUNSAPIURL,
})

export const nounsGraphqlClient = createClient({
  url: NOUNSAPIURL,
})
