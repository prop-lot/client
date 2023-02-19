import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiRequest, NextApiResponse } from 'next'
import { SiweMessage,  } from 'siwe'
import { ironOptions } from '@/lib/config'
import { provider } from '@/utils/ethers'
import AuthService from '@/services/auth'
import getCommunityByDomain from '@/utils/communityByDomain'
 
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req
  switch (method) {
    case 'POST':
      try {
        const { message, signature } = req.body
        const siweMessage = new SiweMessage(message)
        const { data: fields } = await siweMessage.verify({ signature, domain: message.domain, nonce: message.nonce, time: message.issuedAt }, { provider })
 
        if (fields.nonce !== req.session.nonce) {
          return res.status(422).json({ message: 'Invalid nonce.' })
        }

        const { supportedTokenConfig } = getCommunityByDomain(req);

        if (supportedTokenConfig) {
          const tokenCount: number = await supportedTokenConfig.getUserTokenCount(fields.address)
          if (!(tokenCount > 0)) {
            throw new Error(`User does not have a token`);
          }

          const userData = await AuthService.login({ wallet: fields.address });
          req.session.siwe = fields
          req.session.user = userData
          await req.session.save()
          res.json({ ok: true })
        } else {
          throw new Error(`DAO does not exist in proplot`);
        }
      } catch (_error) {
        console.log(_error)
        res.status(401).send({ ok: false })
      }
      break
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
 
export default withIronSessionApiRoute(handler, ironOptions)