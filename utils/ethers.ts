import { providers } from 'ethers'

export const provider = new providers.JsonRpcProvider("https://mainnet.infura.io/v3/4ab8992a9fc64db2b3f81bdd5d043f41")
export const getBlock = async () => {
  try {
    const blockNumber = await provider.getBlockNumber()
    return blockNumber
  } catch (err) {
    throw new Error('Failed to fetch current block')
  }
}
