import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HuggingFaceServiceFactory } from "../huggingFace/HuggingFaceService";
import {
  AuthenticationError,
  NetworkError,
  RateLimitError,
  TokenExpiredError,
  ValidationError,
} from "../ErrorFactory";

import { InferenceClient } from "@huggingface/inference";
import type { MessageContent } from "../huggingFace/types";
import type { Message } from "../../types";
import { mockData } from "../../test/mocks/mocks";

vi.mock("@huggingface/inference", async () => {
  const actual = await vi.importActual<any>("@huggingface/inference");
  return {
    ...actual,
    InferenceClient: vi.fn(),
  };
});

describe("hugginface service", () => {
  const apiKey = "test";
  const prompt: MessageContent[] = [{ role: "user", content: "Hello" }];
  const messages: Message[] = [
    { role: "user", content: "Hello", id: "e", error: null },
  ];
  beforeEach(() => {
    vi.clearAllMocks(); // Limpia todos los vi.fn
    vi.resetModules(); // Resetea módulos importados para evitar estados compartidos
  });

  afterEach(() => {
    vi.useRealTimers(); // Siempre limpia si usaste fakeTimers
  });

  it("should transform the prompt with the enhancedPrompt method", async () => {
    const service = HuggingFaceServiceFactory.create(apiKey);

    const result = await service.enhancePrompt("Hello", mockData, messages);
    const expectedResult = `# SPECIALIZED AI ASSISTANT

    You are an expert AI assistant with access to a curated knowledge base. Your primary function is to provide accurate, helpful responses based on the specific information you've been trained on.

    ## Core Capabilities:
    - Deep understanding of your specialized knowledge domain
    - Ability to cross-reference and connect related information
    - Skilled at providing context and explanations
    - Capable of admitting knowledge limitations

## KNOWLEDGE BASE

### GENERAL
1. **Q:** what are the hours of close or open in the InsightFlow
   **A:** the hours of close or open in the InsightFlow are Monday to Friday from 10am to 4pm 🟢

## RESPONSE INSTRUCTIONS
### Primary Behavior:
- Answer questions using ONLY the information from your knowledge base
- Provide accurate, well-structured responses
- Maintain a helpful and professional tone
- If a question is related but not exact, draw connections from available information
### Confidence Levels:
- 🟢 High confidence: Direct match in knowledge base
- 🟡 Medium confidence: Inferred from related information
- 🔴 Low confidence: Limited or uncertain information
### When Information is Unavailable:
- Ask for clarification or suggest related topics you can help with



## OPERATIONAL CONSTRAINTS
- Never fabricate or hallucinate information
- Always indicate your confidence level
- Cite specific knowledge base entries when possible
- Be as helpful as possible within your knowledge constraints

## USER QUERY
Hello

---
Please provide a comprehensive response based on your knowledge base. Include your confidence level and cite relevant sources from your knowledge base.`;

    expect(result).toEqual([{ role: "user", content: expectedResult }]);
  });

  it("should run onChunk with the correct content", async () => {
    const onChunk = vi.fn();
    (InferenceClient as any).mockImplementation(() => ({
      chatCompletionStream: vi.fn().mockReturnValue(
        (async function* () {
          yield {
            choices: [
              {
                delta: { content: "<think>pensando...</think>" },
                finish_reason: null,
              },
            ],
          };
          yield {
            choices: [
              {
                delta: { content: "hola" },
                finish_reason: "stop",
              },
            ],
          };
        })()
      ),
    }));

    const service = HuggingFaceServiceFactory.create(apiKey);
    await service.run({ onChunk, prompt });
    expect(onChunk).toHaveBeenCalledTimes(2);
    expect(onChunk).toHaveBeenCalledWith("hola");
  });

  it("should rate limiter allows request whihin the configured rate limit windonw", async () => {
    const onChunk = vi.fn();
    const service = HuggingFaceServiceFactory.create(apiKey);
    await service.run({ onChunk, prompt });
    expect(onChunk).toHaveBeenCalledWith("hola");
    expect(onChunk).toHaveBeenCalledTimes(2);
  });

  it("should throw RateLimitError if max requests reached", async () => {
    const onChunk = vi.fn();
    const service = HuggingFaceServiceFactory.create(apiKey);

    await service.run({ onChunk, prompt });
    await service.run({ onChunk, prompt });
    await service.run({ onChunk, prompt });

    await expect(service.run({ onChunk, prompt })).rejects.toThrow(
      RateLimitError
    );
  });

  it("should throw connection error", async () => {
    const onChunk = vi.fn();

    const failingStream = (async function* () {
      throw new NetworkError("network error");
    })();

    (InferenceClient as any).mockImplementation(() => {
      return {
        chatCompletionStream: vi.fn().mockReturnValue(failingStream),
      };
    });
    const service = HuggingFaceServiceFactory.create(apiKey);

    await expect(service.run({ onChunk, prompt })).rejects.toThrowError(
      NetworkError
    );
  });

  it("should throw token expired error", async () => {
    const failingStream = (async function* () {
      throw new Error("invalid_token");
    })();
    (InferenceClient as any).mockImplementation(() => {
      return {
        chatCompletionStream: vi.fn().mockReturnValue(failingStream),
      };
    });

    const service = HuggingFaceServiceFactory.create(apiKey);
    await expect(
      service.run({ onChunk: () => {}, prompt })
    ).rejects.toThrowError(TokenExpiredError);
  });

  it("should throw authentication error", async () => {
    const failingStream = (async function* () {
      throw new Error("unauthorized");
    })();
    (InferenceClient as any).mockImplementation(() => {
      return {
        chatCompletionStream: vi.fn().mockReturnValue(failingStream),
      };
    });

    const service = HuggingFaceServiceFactory.create(apiKey);
    await expect(
      service.run({ onChunk: () => {}, prompt })
    ).rejects.toThrowError(AuthenticationError);
  });

  it("should throw validation error", async () => {
    const failingStream = (async function* () {
      throw new Error("validation");
    })();
    (InferenceClient as any).mockImplementation(() => {
      return {
        chatCompletionStream: vi.fn().mockReturnValue(failingStream),
      };
    });

    const service = HuggingFaceServiceFactory.create(apiKey);
    await expect(
      service.run({ onChunk: () => {}, prompt })
    ).rejects.toThrowError(ValidationError);
  });

  it("should throw a generic error", async () => {
    const failingStream = (async function* () {
      throw new Error("generic error");
    })();
    (InferenceClient as any).mockImplementation(() => {
      return {
        chatCompletionStream: vi.fn().mockReturnValue(failingStream),
      };
    });

    const service = HuggingFaceServiceFactory.create(apiKey);
    await expect(
      service.run({ onChunk: () => {}, prompt })
    ).rejects.toThrowError(Error);
  });

  it("should set the config by props if is passed", async () => {
    const service = HuggingFaceServiceFactory.create(apiKey, {
      model: "test",
      temperature: 0.7,
      max_tokens: 20,
      frequency_penalty: 0.5,
      timeout: 30000,
    });
    expect(service.config.model).toBe("test");
    expect(service.config.temperature).toBe(0.7);
    expect(service.config.max_tokens).toBe(20);
    expect(service.config.frecuency_penalty).toBe(0.5);
    expect(service.config.timeout).toBe(30000);
  });

  it("should have the defualt config if any config has passed", async () => {
    const service = HuggingFaceServiceFactory.create(apiKey);
    expect(service.config.model).toBe("HuggingFaceTB/SmolLM3-3B");
    expect(service.config.temperature).toBe(0.7);
    expect(service.config.max_tokens).toBe(500);
    expect(service.config.frecuency_penalty).toBe(0.5);
    expect(service.config.timeout).toBe(30000);
  });
});
