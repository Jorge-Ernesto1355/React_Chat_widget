import { useEffect, useState } from "react";
import type { Message } from "../types";
import { createInitialMessage } from "../utils/createFirstMessage";

export const useMessageStorage = (keyStorage: string) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const stored = localStorage.getItem(keyStorage);
    return stored ? JSON.parse(stored) : [createInitialMessage()];
  });

  useEffect(() => {
    localStorage.setItem(keyStorage, JSON.stringify(messages));
  }, [keyStorage, messages]);

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, { ...message, id: crypto.randomUUID() }]);
  };

  const updateMessages = (updater: (prev: Message[]) => Message[]) => {
    setMessages((prev) => {
      const newMessages = updater(prev);
      localStorage.setItem(keyStorage, JSON.stringify(newMessages));
      return newMessages;
    });
  };

  return { messages, updateMessages, addMessage };
};
