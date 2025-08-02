import React, { useEffect, useMemo } from "react";
import { Role, type Message } from "../types";
import {
  createMessage,
  INITIAL_MESSAGE_CONTENT,
} from "../utils/createFirstMessage";
import { useMessageStorage } from "./useMessageStorage";
import type { ErrorType } from "../components/errors/AIErrorMessage";

interface returnType {
  messages: Message[];
  addMessageUser: (text: string) => Promise<Message | undefined>;
  addMessageAssistant: (chunk: string, options?: optionsMessage) => void;
}

export type optionsMessage = {
  error?: string;
  isLoading?: boolean;
  errorType?: ErrorType;
};

const isValidMessage = (message: string): boolean => {
  return typeof message === "string" && message.trim() !== "";
};

/**
 * Custom React hook to manage chat messages.
 * Provides functions to add user and assistant messages with validation and concatenation logic.
 */

const useMessages = (): returnType => {
  const keyStorage = useMemo(() => `chat-messages`, []);
  const { messages, updateMessages, addMessage } =
    useMessageStorage(keyStorage);
  useEffect(() => {
    localStorage.setItem("chat-messages", JSON.stringify(messages));
  }, [messages]);

  const addMessageUser = React.useCallback(
    async (text: string): Promise<Message | undefined> => {
      if (!isValidMessage(text)) return undefined;
      const message = createMessage(Role.User, text);
      addMessage(message);
      return message;
    },
    []
  );

  const addMessageAssistant = React.useCallback(
    (chunk: string = "", options?: optionsMessage) => {
      const isLoading = options?.isLoading ?? false;
      const error = options?.error ?? null;
      const errorType = options?.errorType ?? "general";

      updateMessages((prev) => {
        const lastMessage = prev[prev.length - 1];

        //if the user has not typed anyting and the last message is the initial message, do not add a new message
        if (lastMessage.content === INITIAL_MESSAGE_CONTENT) return [...prev];

        // If no message yet or last message is not assistant, add new assistant message
        if (!lastMessage || lastMessage.role !== Role.Assistant) {
          return [
            ...prev,
            createMessage(Role.Assistant, chunk, isLoading, error),
          ];
        }

        // If last message is assistant, append chunk to its content
        return [
          ...prev.slice(0, -1),
          {
            ...lastMessage,
            content: lastMessage.content + chunk,
            isLoading,
            error,
            errorType,
          },
        ];
      });
    },
    []
  );

  return React.useMemo(
    () => ({
      messages, // Return a copy of the messages array
      addMessageUser,
      addMessageAssistant,
    }),
    [messages, addMessageUser, addMessageAssistant]
  );
};

export default useMessages;
