import { createBreakpoint } from "react-use";
import { Button, FormControl } from "react-bootstrap";

const useBreakpoint = createBreakpoint({ XL: 1440, L: 940, M: 650, S: 540 });

const CommentInput = ({
  value,
  setValue,
  hasTokens,
  hideInput = undefined,
  onSubmit,
}: {
  value: string;
  setValue: (val: string) => void;
  hasTokens: boolean;
  hideInput?: (val: boolean) => void;
  onSubmit: () => void;
}) => {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === "S";
  const canHideInput = typeof hideInput === "function";

  return (
    <div className="relative mt-4">
      <FormControl
        as="textarea"
        placeholder="Type your commment..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`border rounded-lg w-full pt-3 pb-3 pl-3 ${
          canHideInput && !isMobile ? "!pr-[162px]" : "!pr-[90px]"
        } relative`}
      />
      <div
        className={`absolute right-2 bottom-[10px] ${
          isMobile ? "flex align-items-center flex-column-reverse" : ""
        }`}
      >
        {canHideInput && (
          <span
            className={`font-bold text-[#8C8D92] cursor-pointer ${
              isMobile ? "!pt-[8px]" : "mr-4"
            }`}
            onClick={() => hideInput(true)}
          >
            Cancel
          </span>
        )}

        <Button
          className={`${
            hasTokens
              ? "rounded-lg !bg-[#2B83F6] !text-white !font-bold"
              : "!text-[#8C8D92] !bg-[#F4F4F8] !border-[#E2E3E8] !font-bold"
          } p-1 rounded`}
          onClick={() => {
            if (hasTokens && value.length > 0) {
              onSubmit();
            }
          }}
        >
          Comment
        </Button>
      </div>
    </div>
  );
};

export default CommentInput;
