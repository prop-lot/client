import { useContractRead, useBlockNumber } from "wagmi";

const TOKEN_CONTRACT_ADDRESS = {
  nouns: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03",
  lilNouns: "0x4b10701Bfd7BFEdc47d50562b76b436fbB5BdB3B",
};

const useDelegateCount = (address?: string, blockNumber?: number) => {
  const { data: currentBlockNumber } = useBlockNumber();

  const ABI = [
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "blockNumber",
          type: "uint256",
        },
      ],
      name: "getPriorVotes",
      outputs: [
        {
          internalType: "uint96",
          name: "",
          type: "uint96",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  const { data, error, isLoading } = useContractRead({
    address: TOKEN_CONTRACT_ADDRESS["lilNouns"],
    abi: ABI,
    functionName: "getPriorVotes",
    // if blockNumber is not specified, we use currentBlock minus 1 (can't use current bc the count is not known)
    args: [address, blockNumber || currentBlockNumber! - 1],
  });

  return { data, error, isLoading };
};

export default useDelegateCount;
