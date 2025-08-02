import type { Message } from "../../types";
import type { AIServiceError } from "../ErrorFactory";
import type { DataProps, useCase } from "../utils/EnhancePrompt";

export interface StreamChunk {
  generated_text?: string;
}

export interface ChatCompletionParams {
  provider: string;
  model: string;
  messages: {
    role: string;
    content: string;
    temperature?: number;
    max_tokens?: number;
  }[];
}

export type MessageContent = Omit<
  Message,
  "id" | "error" | "isLoading" | "className"
>;

export interface HuggingFaceClient {
  generatePipe: (model: string, params: any) => Promise<any>;
}

export interface RateLimiter {
  checkLimit(): Promise<boolean>;
  getRemainingRequests(): number;
}

export interface MessageMapper {
  mapToHuggingFaceFormat(
    messages: MessageContent[]
  ): ChatCompletionParams["messages"];
}

export interface PromptEnhancer {
  enhancePromptUser(prompt: string, data: DataProps, useCase: useCase): string;
  enhance({
    prompt,
    data,
    messages,
  }: {
    prompt: string;
    data: DataProps;
    messages?: Message[];
  }): Promise<MessageContent[]>;
}

export interface EnhancePromptProps {
  prompt: string;
  data: DataProps;
  messages?: Message[];
}

export interface StreamProcessor {
  processChunk(
    chunk: string | StreamChunk,
    onChunk?: (content: string) => void
  ): boolean;
}

export interface ErrorDetector {
  detectErrorType(error: any): AIServiceError | null;
}
