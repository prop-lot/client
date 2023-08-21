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
      <div className="text-center place-items-center justify-center grid w-full py-24">
        <Image
          src="/logo.svg"
          alt="PropLot logo, which is a car noun with text spelling prop lot."
          width="280"
          height="120"
        />
        <h1 className="font-medium font-londrina text-xxl py-sm">
          No ideas found
        </h1>
        <p className="font-medium font-inter pt-sm pb-md">{message}</p>
        {appliedFilters.length > 0 && !error && (
          <button
            onClick={() => clearFilters()}
            className="bg-black text-white font-bold !border-none !text-base flex-1 sm:flex-none !rounded-[10px] !font-inter !pt-sm !pb-sm !pl-md !pr-md"
          >
            Clear filters
          </button>
        )}
        {error && (
          <button
            onClick={() => {
              return router.reload();
            }}
            className="bg-black text-white font-bold !border-none !text-base flex-1 sm:flex-none !rounded-[10px] !font-inter !pt-sm !pb-sm !pl-md !pr-md"
          >
            Retry
          </button>
        )}
      </div>
    </>
  );
};

export default EmptyState;
