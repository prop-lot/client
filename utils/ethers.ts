import { providers } from 'ethers'

export const provider = new providers.JsonRpcProvider(process.env.JSON_RPC_CLIENT)
export const getBlock = async () => {
    const blockNumber = await provider.getBlockNumber()
    return blockNumber
}
