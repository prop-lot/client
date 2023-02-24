import {
  useContext,
  useState,
  createContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import ErrorModal from "@/components/ErrorModal";

type ApiError =
  | {
      message: string;
      status: number;
    }
  | undefined;

interface ErrorModalCtx {
  error: ApiError;
  setError: Dispatch<
    SetStateAction<{ message: string; status: number } | undefined>
  >;
}

const ErrorModalContext = createContext<ErrorModalCtx>({
  error: undefined,
  setError: () => undefined,
});

export const ErrorModalProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState(undefined as ApiError);

  return (
    <ErrorModalContext.Provider
      value={{
        error,
        setError,
      }}
    >
      {error && (
        <ErrorModal
          title={error.status === 401 ? "You're account isn't able to do that" : "Something went wrong!"}
          content={error.message}
          status={error.status}
          onDismiss={() => {
            setError(undefined);
          }}
        />
      )}
      {children}
    </ErrorModalContext.Provider>
  );
};

export const useApiError = () => {
  const context = useContext(ErrorModalContext);
  if (context === undefined) {
    throw new Error("useApiError must be used within an ErrorModalProvider");
  }
  return context;
};
