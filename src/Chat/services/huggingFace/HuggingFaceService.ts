import { InferenceClient } from "@huggingface/inference";
import type { AIservice, RunProps } from "../Service";
import type { Message } from "../../types";
import type {
  EnhancePromptProps,
  ErrorDetector,
  MessageContent,
  PromptEnhancer,
  RateLimiter,
} from "./types";

import {
  AIServiceError,
  DefaultErrorDetector,
  ErrorFactory,
  RateLimitError,
} from "../ErrorFactory";

import {
  HuggingFaceConfig,
  type IHuggingFaceConfig,
} from "./huggingFaceBuilder";
import {
  getEnhancePromptByUseCase,
  type DataProps,
} from "../utils/EnhancePrompt";

export class HuggingFaceService implements AIservice<MessageContent[]> {
  private ratelimiter: RateLimiter = new SimpleRateLimiter();
  private promptEnhancer: PromptEnhancer = new DefaultPromptEnhancer();
  private errorDetector: ErrorDetector = new DefaultErrorDetector();
  public readonly config: HuggingFaceConfig;
  private controller: AbortController = new AbortController();

  constructor(config: HuggingFaceConfig) {
    this.config = config;
  }

  async run({ onChunk, prompt }: RunProps<MessageContent[]>) {
    try {
      await this.checkRateLimit();

      await this.processStream(prompt, onChunk);
    } catch (error) {
      console.log(error);
      if (this.isAbortError(error)) {
        return;
      }
      this.controller.abort();
      this.handleError(error);
    }
  }

  private async checkRateLimit(): Promise<void> {
    try {
      const canProceed = await this.ratelimiter.checkLimit();
      if (!canProceed) {
        throw ErrorFactory.createRateLimitError();
      }
    } catch (error) {
      // Re-throw rate limit errors directly
      if (error instanceof RateLimitError) {
        throw error;
      }
      // Handle other errors that might occur during rate limit check
      throw this.detectAndThrowError(error);
    }
  }

  async enhancePrompt(
    prompt: string,
    data: any,
    messages?: Message[]
  ): Promise<MessageContent[]> {
    return await this.promptEnhancer.enhance({
      prompt,
      data,
      messages,
    });
  }

  private handleError(error: unknown): never {
    if (error instanceof AIServiceError) {
      throw error;
    }
    throw this.detectAndThrowError(error);
  }

  private detectAndThrowError(error: unknown): never {
    const detectedError = this.errorDetector.detectErrorType(error);
    if (detectedError) {
      throw detectedError;
    }

    if (error instanceof Error) {
      const genericError = ErrorFactory.createGenericError(
        `${error.message}`,
        error
      );
      throw genericError;
    }

    const unknownError = ErrorFactory.createGenericError(
      "An unknown error occurred"
    );
    throw unknownError;
  }
  private isAbortError(error: unknown): boolean {
    // Check for DOMException with name 'AbortError'
    if (error instanceof DOMException && error.name === "AbortError") {
      return true;
    }

    // Check for generic Error with abort-related messages
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes("abort") ||
        message.includes("cancelled") ||
        message.includes("canceled") ||
        message.includes("signal")
      );
    }

    return false;
  }

  public abort() {
    this.controller.abort();
  }

  private async processStream(
    prompt: MessageContent[],
    onChunk: (content: string) => void
  ) {
    const client = new InferenceClient(this.config.apiKey);

    const stream = client.chatCompletionStream(
      {
        provider: "hf-inference",
        model: this.config.model,
        max_tokens: this.config.max_tokens,
        temperature: this.config.temperature,
        messages: prompt || [{ role: "user", content: "hello" }],
      },
      {
        signal: this.controller.signal,
      }
    );

    let buffer = "";
    let isThinking = false;
    let isReadyToEmit = false;
    let thinkingStartTime = null;

    try {
      for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content || "";

        if (!content) continue;

        buffer += content;

        if (buffer.includes("<think>")) {
          if (!isThinking) {
            isThinking = true;
            isReadyToEmit = false;
            thinkingStartTime = Date.now();
          }
        }

        if (buffer.includes("</think>")) {
          isThinking = false;
          isReadyToEmit = true;
          thinkingStartTime = null;
        }

        // Check timeout in the main loop
        if (
          isThinking &&
          thinkingStartTime &&
          Date.now() - thinkingStartTime > 5000
        ) {
          throw ErrorFactory.createGenericError(
            "the max_tokens is too short, please increase it to avoid this error"
          );
        }

        if (!isThinking && isReadyToEmit) {
          onChunk(content);
        }
      }

      // Final check if stream ended while thinking
      if (isThinking && !buffer.includes("</think>")) {
        throw ErrorFactory.createGenericError(
          "Stream ended while still thinking - max_tokens might be too short"
        );
      }
    } catch (error) {
      throw error;
    }
  }
}

class DefaultPromptEnhancer implements PromptEnhancer {
  enhancePromptUser(prompt: string, data: DataProps): string {
    const enhancePrompt = getEnhancePromptByUseCase(
      data.useCase ?? "customer-support"
    );

    const enhancedPrompt = enhancePrompt(prompt, data);

    return enhancedPrompt;
  }

  async enhance({
    prompt,
    data,
    messages,
  }: EnhancePromptProps): Promise<MessageContent[]> {
    if (!messages || messages.length === 0) return [];
    const newMessages = [...messages];
    const messagesFiltred = newMessages
      .map((msg) => {
        if (msg.role === "user") {
          return {
            role: "user" as const,
            content: this.enhancePromptUser(prompt, data),
          };
        }
        return msg;
      })
      .filter((msg): msg is Message => msg !== undefined);

    return messagesFiltred;
  }
}

export class HuggingFaceServiceFactory {
  static create(
    apiKey: string,
    options?: IHuggingFaceConfig
  ): HuggingFaceService {
    const cfg = options ?? {
      model: "HuggingFaceTB/SmolLM3-3B",
      temperature: 0.7,
      max_tokens: 500,
      timeout: 30000,
      frequency_penalty: 0.5,
    };

    const configBuilder = HuggingFaceConfig.builder()
      .setApiKey(apiKey)
      .setModel(cfg.model)
      .setTemperature(cfg.temperature)
      .setFrequencyPenalty(cfg.frequency_penalty ?? 0.5)
      .setMaxTokens(cfg.max_tokens)
      .setTimeout(cfg.timeout);

    const config = configBuilder.build();

    return new HuggingFaceService(config);
  }
}
export class SimpleRateLimiter implements RateLimiter {
  private requests: number = 0;
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private windowStart: number = Date.now();

  constructor(maxRequests: number = 3, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now();

    if (now - this.windowStart >= this.windowMs) {
      this.requests = 0;
      this.windowStart = now;
    }

    if (this.requests >= this.maxRequests) {
      return false;
    }

    this.requests++;
    return true;
  }

  getRemainingRequests(): number {
    return Math.max(0, this.maxRequests - this.requests);
  }
}
