import { useState } from "react";
import { useContractWrite, useContractRead } from "wagmi";
import { Row, Container, Col } from "react-bootstrap";
import { abi as NounsDAODataABI } from "../lib/nouns/abis/NounsDAOData";
import { useForm } from "react-hook-form";
import { contracts } from "../lib/nouns/contracts";

enum ProposalType {
  STREAM_FUNDS = "Stream funds",
  TRANSFER_FUNDS = "Transfer funds",
  FUNCTION_CALL = "Function call",
}

const TransferFundsProposalForm = ({ register }: { register: any }) => {
  return (
    <div>
      <h2 className="font-bold text-xl mb-4">Transfer Funds</h2>
      <div className="flex flex-col my-4">
        <div className="flex justify-between w-full items-center">
          <label className="font-bold mb-2">Currency</label>
        </div>
        {/* might be better if select option values are the contract address */}
        <select {...register("currency")} className="w-full border rounded p-2">
          <option value="USDC">USDC</option>
          <option value="ETH">ETH</option>
          <option value="STETH">Lido Staked ETH</option>
        </select>
      </div>
      <div className="flex flex-col my-4">
        <div className="flex justify-between w-full items-center">
          <label className="font-bold mb-2">Recipient</label>
        </div>
        <input
          {...register("recipient")}
          type="text"
          className="border rounded-lg p-2"
        />
      </div>
      <div className="flex flex-col my-4">
        <div className="flex justify-between w-full items-center">
          <label className="font-bold mb-2">Amount</label>
        </div>
        <input
          {...register("amount")}
          type="text"
          className="border rounded-lg p-2"
        />
      </div>
    </div>
  );
};

const StreamFundsProposalForm = ({ register }: { register: any }) => {
  return (
    <div>
      <div>
        <h2 className="font-bold text-xl mb-4">Stream Funds</h2>
        <select {...register("currency")} className="w-full border rounded p-2">
          <option value="ETH">WETH</option>
          <option value="USDC">USDC</option>
        </select>
        <div className="flex flex-col my-4">
          <div className="flex justify-between w-full items-center">
            <label className="font-bold mb-2">Recipient</label>
          </div>
          <input
            {...register("recipient")}
            type="text"
            className="border rounded-lg p-2"
          />
        </div>
        <div className="flex flex-col my-4">
          <div className="flex justify-between w-full items-center">
            <label className="font-bold mb-2">Amount</label>
          </div>
          <input
            {...register("amount")}
            type="text"
            className="border rounded-lg p-2"
          />
        </div>
      </div>
    </div>
  );
};

const FunctionCallProposalForm = ({ register }: { register: any }) => {
  return (
    <div>
      <h2 className="font-bold text-xl mb-4">Function Call</h2>
    </div>
  );
};

const ProposalForm = ({
  proposalType,
  register,
}: {
  proposalType: ProposalType;
  register: any;
}) => {
  switch (proposalType) {
    case ProposalType.STREAM_FUNDS:
      return <StreamFundsProposalForm register={register} />;
    case ProposalType.TRANSFER_FUNDS:
      return <TransferFundsProposalForm register={register} />;
    case ProposalType.FUNCTION_CALL:
      return <FunctionCallProposalForm register={register} />;
    default:
      return <></>;
  }
};

const CandidatePage = () => {
  const { data: proposalCost } = useContractRead({
    address: contracts[5].nounsDAOData as `0x${string}`,
    abi: NounsDAODataABI,
    functionName: "createCandidateCost",
  });

  const [proposalType, setProposalType] = useState<ProposalType>();

  const { data, isLoading, isSuccess, write } = useContractWrite({
    chainId: 5,
    address: contracts[5].nounsDAOData as `0x${string}`,
    abi: NounsDAODataABI,
    functionName: "createProposalCandidate",
    value: proposalCost || BigInt(100000000000000), // 0.00001 ETH, cost as of 08-13-23
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
    // const handleCreateProposal = async () => {
    //   await createProposalCandidate(
    //     proposalTransactions.map(({ address }) => address), // Targets
    //     proposalTransactions.map(({ value }) => value ?? '0'), // Values
    //     proposalTransactions.map(({ signature }) => signature), // Signatures
    //     proposalTransactions.map(({ calldata }) => calldata), // Calldatas
    //     `# ${titleValue}\n\n${bodyValue}`, // Description
    //     slug, // Slug
    //     0, // proposalIdToUpdate - use 0 for new proposals
    //     { value: hasVotes ? 0 : createCandidateCost }, // Fee for non-nouners
    //   );
    // };

    const slug = data.title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

    // for eth transfer, recipient is address
    write({
      args: [
        ["0xE7affDB964178261Df49B86BFdBA78E9d768Db6D"],
        [BigInt(1000000000)],
        [""],
        ["0x"],
        `# ${data.title}\n\n${data.description}`,
        slug,
        BigInt(0),
      ],
    });
  };

  return (
    <Container fluid={"lg"} className="mt-8 mb-12">
      <Row className="align-items-center">
        <Col lg={7} className="mx-auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h1 className="text-black text-4xl font-bold">New Proposal</h1>
            <p className="mt-4">
              Fill in the form below to submit your proposal for a consensus
              check. Once the proposal receives sponsorship from at least two
              Nouns, it will be promoted to a governance vote for a final
              decision.
            </p>
            <p className="mt-4">
              This is a proposal to{" "}
              <a href="#" target="_blank" className="text-green-400">
                Nouner name
              </a>{" "}
              idea{" "}
              <a href="#" target="_blank" className="text-green-400">
                Idea name
              </a>
              .
            </p>
            <h3 className="mt-4 font-bold text-xl">Proposal Details</h3>
            <div className="flex flex-col my-4">
              <div className="flex justify-between w-full items-center">
                <label className="font-bold mb-2">Title</label>
              </div>
              <input
                {...register("title")}
                type="text"
                className="border rounded-lg p-2"
                placeholder="Give your candidate a name..."
              />
            </div>
            <div className="flex flex-col my-4">
              <div className="flex justify-between w-full items-center">
                <label className="font-bold mb-2">Description</label>
              </div>
              <textarea
                {...register("description")}
                className="border rounded-lg p-2"
                placeholder="Describe your candidate proposal"
              />
            </div>
            <h3 className="mt-4 font-bold text-xl">On-chain Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <select
                  className="w-full border rounded p-2"
                  onChange={(e) => {
                    setProposalType(e.target.value as ProposalType);
                  }}
                >
                  <option disabled>Choose action type</option>
                  <option value={ProposalType.TRANSFER_FUNDS}>
                    Transfer Funds
                  </option>
                  <option value={ProposalType.STREAM_FUNDS}>
                    Stream Funds
                  </option>
                  <option value={ProposalType.FUNCTION_CALL}>
                    Function Call
                  </option>
                </select>
              </div>
              <div className="bg-gray-200 rounded p-4 flex flex-col space-y-3">
                <h3 className="text-lg font-bold">Supported action types</h3>
                <span>
                  <strong>Transfer funds:</strong> Send USDC, ETH
                </span>
                <span>
                  <strong>Stream funds:</strong> Stream USDC or WETH
                </span>
                <span>
                  <strong>Function call:</strong> Call a contract function
                </span>
              </div>
            </div>
            <section className="mt-4">
              {proposalType && (
                <ProposalForm proposalType={proposalType} register={register} />
              )}
            </section>
            {/* TODO: add disabled state to button */}
            <button
              className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg mt-4"
              type="submit"
            >
              Submit Proposal
            </button>
            <span className="text-gray-400 text-sm mt-4 block">
              To prevent spam, a payment of 0.01 ETH is required to submit
              proposals, unless you are a Noun holder. All of the proceeds are
              sent to the Noun DAO treasury.
            </span>
          </form>
        </Col>
      </Row>
    </Container>
  );
};

export default CandidatePage;
