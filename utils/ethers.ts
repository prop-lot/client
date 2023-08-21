import { providers, utils } from "ethers";

export const provider = new providers.JsonRpcProvider(
  process.env.JSON_RPC_CLIENT
);
export const getBlock = async () => {
  try {
    const blockNumber = await provider.getBlockNumber();
    return blockNumber;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch current block");
  }
};

export const getEtherBalance = async (address: string) => {
  try {
    const balance = await provider.getBalance(address);
    return balance;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch balance");
  }
};

export const formatEthValue = (value: any) => {
  return utils.formatEther(value);
}
