import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiRequest, NextApiResponse } from 'next'
import { SiweMessage } from 'siwe'
import { ironOptions } from '@/lib/config'
import AuthService from '@/services/auth'
import { NOUNS_BY_OWNER_SUB } from '@/graphql/subgraph'
import { nounsGraphqlClient, lilNounsGraphqlClient } from '@/graphql/clients/nouns-graphql-client'

const SupportedTokenGetterMap = {
  lilnouns: {
    type: 'LIL_NOUNS',
    getTokenCount: async (address: string) => {
      try {
        const data: any = await lilNounsGraphqlClient.query(NOUNS_BY_OWNER_SUB, { id: address.toLowerCase() }).toPromise()
        return data?.data?.account?.nouns?.length
      } catch(e) {
        throw new Error('Failed to fetch token count from subgraph')
      }
    }
  },
  nouns: {
    type: 'NOUNS',
    getTokenCount: async (address: string) => {
      try {
        const data: any = await nounsGraphqlClient.query(NOUNS_BY_OWNER_SUB, { id: address.toLowerCase() }).toPromise()
        return data?.data?.account?.nouns?.length
      } catch(e) {
        throw new Error('Failed to fetch token count from subgraph')
      }
    }
  }
}
 
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req
  switch (method) {
    case 'POST':
      try {
        const { message, signature } = req.body
        const siweMessage = new SiweMessage(message)
        const fields = await siweMessage.validate(signature)
 
        if (fields.nonce !== req.session.nonce) {
          return res.status(422).json({ message: 'Invalid nonce.' })
        }

        // TODO: Check a header or host name here to determine if this is nouns vs lilnouns and make contract call? How do we make
        // this more scaleable? Something like below:

        const supportedToken = SupportedTokenGetterMap['lilnouns']

        if (supportedToken) {
          const tokenCount: number = await supportedToken.getTokenCount(fields.address)
          console.log(tokenCount)
          if (!(tokenCount > 0)) {
            throw new Error(`User does not have a token`);
          }

          const userData = await AuthService.login({ wallet: fields.address, lilnounCount: tokenCount });
          req.session.siwe = fields
          req.session.user = userData
          await req.session.save()
          res.json({ ok: true })
        } else {
          throw new Error(`DAO does not exist in proplot`);
        }
      } catch (_error) {
        res.json({ ok: false })
      }
      break
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
 
export default withIronSessionApiRoute(handler, ironOptions)