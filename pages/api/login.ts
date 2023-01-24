import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiRequest, NextApiResponse } from 'next'
import { SiweMessage } from 'siwe'
import { ironOptions } from '@/lib/config'
import AuthService from '@/services/auth'

// TODO: Potential implementation to scale to other DAOS?

// const SupportedTokenGetterMap = {
//   lilnouns: {
//     type: 'LIL_NOUNS',
//     getTokenCount: (address) => lilNounTokenCount(address)
//   },
//   nouns: {
//     type: 'NOUNS',
//     getTokenCount: (address) => nounTokenCount(address)
//   }
// }
 
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

        /*
          const supportedToken = SupportedTokenGetterMap['PROPLOT_DAO_HEADER']

          if (supportedToken) {
            const tokenCount = supportedToken.getTokenCount(fields.address)

            if (!(tokenCount > 0)) {
              throw new Error(`User does not have a token`);
            }

            const userData = await AuthService.login({ wallet: fields.address, token: { type: supportedToken.type, count: tokenCount } });
            req.session.siwe = fields
            req.session.user = userData
            await req.session.save()
            res.json({ ok: true })
          } else {
            throw new Error(`DAO does not exist in proplot`);
          }
        */

        const lilnounCount = 10 // TODO: Hook up to contract call - await nounTokenCount(fields.address);

        if (!(lilnounCount > 0)) {
          throw new Error(`User does not have a lil noun`);
        }

        // We save the count of the tokens against the user for easy calculations. Do we need to add a new property to the user for nouns token counts?
        // How do we keep these in sync with
        const userData = await AuthService.login({ wallet: fields.address, lilnounCount });
 
        req.session.siwe = fields
        req.session.user = userData
        await req.session.save()
        res.json({ ok: true })
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