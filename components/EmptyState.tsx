import Image from "next/image";
import { useRouter } from "next/router";

const EmptyState = ({
  appliedFilters,
  error,
  clearFilters,
}: {
  appliedFilters: string[];
  error: any;
  clearFilters: () => void;
}) => {
  const router = useRouter();
  const hasAppliedFilters = appliedFilters.length > 0;

  let message = "We couldn't find any ideas, submit your own now";

  if (hasAppliedFilters) {
    message = "Clear your filters or submit your own idea";
  }

  if (error) {
    message = "Something went wrong";
  }

  return (
    <>
      <div className="text-center place-items-center grid py-24">
        <Image
          src="/logo.svg"
          alt="PropLot logo, which is a car noun with text spelling prop lot."
          width="280"
          height="120"
        />
        <h1 className="font-medium font-londrina text-3xl py-[8px]">
          No ideas found
        </h1>
        <p className="font-medium font-propLot pt-[8px] pb-[16px]">{message}</p>
        {appliedFilters.length > 0 && !error && (
          <button
            onClick={() => clearFilters()}
            className="bg-black text-white font-bold !border-none !text-[16px] flex-1 sm:flex-none !rounded-[10px] !font-propLot !pt-[8px] !pb-[8px] !pl-[16px] !pr-[16px]"
          >
            Clear filters
          </button>
        )}
        {error && (
          <button
            onClick={() => {
              return router.reload();
            }}
            className="bg-black text-white font-bold !border-none !text-[16px] flex-1 sm:flex-none !rounded-[10px] !font-propLot !pt-[8px] !pb-[8px] !pl-[16px] !pr-[16px]"
          >
            Retry
          </button>
        )}
      </div>
    </>
  );
};

export default EmptyState;
