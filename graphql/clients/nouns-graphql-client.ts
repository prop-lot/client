import { createClient } from 'urql'

const LILNOUNSAPIURL = 'https://api.thegraph.com/subgraphs/name/lilnounsdao/lil-nouns-subgraph'
const NOUNSAPIURL = 'https://api.goldsky.com/api/public/project_cldf2o9pqagp43svvbk5u3kmo/subgraphs/nouns/0.2.0/gn'

export const lilNounsGraphqlClient = createClient({
  url: LILNOUNSAPIURL,
})

export const nounsGraphqlClient = createClient({
  url: NOUNSAPIURL,
})
