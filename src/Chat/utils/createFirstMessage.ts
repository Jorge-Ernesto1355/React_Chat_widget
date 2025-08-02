import { Role, type Message } from "../types";

export const INITIAL_MESSAGE_CONTENT =
  "Hi, I'm an AI assistant. How can I help you today? ";
export const createMessage = (
  role: Role,
  content: string,
  isLoading?: boolean,
  error: string | null = null
): Message => ({
  id: crypto.randomUUID(),
  role,
  content,
  error: error ?? null,
  isLoading: isLoading ?? false,
});

export const createInitialMessage = (): Message => {
  return createMessage(Role.Assistant, INITIAL_MESSAGE_CONTENT);
};
