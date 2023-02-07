import { providers } from 'ethers'

export const provider = new providers.JsonRpcProvider(process.env.JSON_RPC_CLIENT)
export const getBlock = async () => {
  try {
    const blockNumber = await provider.getBlockNumber()
    return blockNumber
  } catch (err) {
    throw new Error('Failed to fetch current block')
  }
}
