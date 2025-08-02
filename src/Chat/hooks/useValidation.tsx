import { useMemo } from "react";
import { validateExclusiveKeys } from "../utils/chooseServiceByProps";
import ErrorComponent from "../components/errors/ErrorComponent";
import { validateToken } from "../utils/validateTokens";
import { ErrorMessages } from "../utils/errorsMessage";
import { useChatContext } from "../context/Context";

const useValidation = () => {
  const { huggingface, replicate } = useChatContext();
  const validation = useMemo(() => {
    const result = validateExclusiveKeys({ huggingface, replicate });
    if (!result.success) {
      return {
        errorComponent: (
          <ErrorComponent
            className="row-span-6"
            message={ErrorMessages.NotConfiguredKeys}
            details={`${ErrorMessages.NotConfiguredKeysDetails} ${result.error}`}
            onRetry={() => window.location.reload()}
          />
        ),
      };
    }
    const { key, value: apiKey } = result;
    const tokenValidationResult = validateToken(key, apiKey);
    if (!tokenValidationResult.isValid) {
      return {
        errorComponent: (
          <ErrorComponent
            className="row-span-6"
            message={ErrorMessages.InvalidToken}
            details={`${ErrorMessages.InvalidTokenDetails} ${tokenValidationResult.error}`}
            onRetry={() => window.location.reload()}
          />
        ),
      };
    }
    return { key, apiKey, tokenValidationResult, result };
  }, [huggingface, replicate]);

  return validation;
};

export default useValidation;
