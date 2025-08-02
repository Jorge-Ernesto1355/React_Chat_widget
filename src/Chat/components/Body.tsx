import { useCallback, useEffect, useState } from "react";
import useMessages from "../hooks/useMessages";
import useAIService from "../hooks/useAIService";
import SmartAutoScrollMessages from "../utils/SmartAutoMessages";
import useValidation from "../hooks/useValidation";
import { AIServiceError } from "../services/ErrorFactory";
import getTypeError from "../utils/getTypeError";
import { useChatContext } from "../context/Context";

export interface IBodyProps {
  onReady: (handler: (message: string) => void) => void;
}

const Body = ({ onReady }: IBodyProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { messages, addMessageUser, addMessageAssistant } = useMessages();
  const validation = useValidation();
  const data = useChatContext().data;
  const config = useChatContext().config;

  if ("errorComponent" in validation) {
    return validation.errorComponent;
  }

  const {
    key: serviceName,
    apiKey,
    tokenValidationResult,
    result,
  } = validation;

  const runAI = useAIService({
    config,
    serviceName,
    apiKey,
    data,
    onChunk: addMessageAssistant,
  });

  const stableOnSubmit = useCallback(
    async (msg: string) => {
      if (
        !result.success ||
        !tokenValidationResult.isValid ||
        msg.trim() === ""
      )
        return;
      const messageCreated = await addMessageUser(msg);
      try {
        setIsLoading(true);

        if (!messageCreated) return;
        await runAI(msg, [...messages, messageCreated]);
      } catch (error: any) {
        if (error instanceof AIServiceError) {
          const errorType = getTypeError(error);

          addMessageAssistant(error.message, {
            error: error.message,
            isLoading,
            errorType,
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [result, tokenValidationResult, addMessageUser, runAI, addMessageAssistant]
  );

  useEffect(() => {
    onReady(stableOnSubmit);
  }, []);

  useEffect(() => {
    if (isLoading) {
      addMessageAssistant("", { isLoading: true });
    }
  }, [isLoading]);

  return (
    <>
      <SmartAutoScrollMessages messages={messages} />
    </>
  );
};

export default Body;
