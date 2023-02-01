import { providers } from 'ethers'

export const provider = new providers.JsonRpcProvider(process.env.JSON_RPC_CLIENT)
export const getBlock = async () => {
    console.log('GETTIN BLOCK')

    const blockNumber = await provider.getBlockNumber()
    console.log(blockNumber)
    return blockNumber
}
