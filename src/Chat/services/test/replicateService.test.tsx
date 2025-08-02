import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ReplicateServiceFactory,
  type IReplicateConfigProps,
} from "../replicateService/replicateServiceBuilder";
import { AIServiceError } from "../ErrorFactory";
import type { DataProps } from "../utils/EnhancePrompt";

const mockReader = {
  read: vi.fn(),
};

const mockResponse = {
  ok: true,
  status: 200,
  body: {
    getReader: () => mockReader,
  },
};

globalThis.fetch = vi.fn();

describe("replicateService", () => {
  const apiKey = "fake";
  const propmt = "hello";
  const data: DataProps = {
    questions: [{ question: "hola", answer: "mundo" }],
  };
  beforeEach(() => {
    vi.clearAllMocks();
    mockReader.read = vi.fn();
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);
  });

  it("should return the improved prompt", async () => {
    const service = ReplicateServiceFactory.create(apiKey);
    const result = await service.enhancePrompt(propmt, data);
    const expectedResult = `# SPECIALIZED AI ASSISTANT

    You are an expert AI assistant with access to a curated knowledge base. Your primary function is to provide accurate, helpful responses based on the specific information you've been trained on.

    ## Core Capabilities:
    - Deep understanding of your specialized knowledge domain
    - Ability to cross-reference and connect related information
    - Skilled at providing context and explanations
    - Capable of admitting knowledge limitations

## KNOWLEDGE BASE

### GENERAL
1. **Q:** hola
   **A:** mundo 🟢

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
hello

---
Please provide a comprehensive response based on your knowledge base. Include your confidence level and cite relevant sources from your knowledge base.`;

    expect(result).toBe(expectedResult);
  });

  it("should call onChunk with streamed content", async () => {
    const data = { raw_data: "hola" };
    const eventData = `event: ${"raw_stream"}\ndata: ${JSON.stringify(
      data
    )}\n\n`;
    const encoder = new TextEncoder();
    mockReader.read
      .mockResolvedValueOnce({
        done: false,
        value: encoder.encode(eventData),
      })
      .mockResolvedValueOnce({
        done: false,
        value: encoder.encode(eventData),
      })
      .mockResolvedValueOnce({
        done: true,
        value: encoder.encode(""),
      });

    const onChunk = vi.fn();
    const service = ReplicateServiceFactory.create(apiKey);
    await service.run({ onChunk, prompt: propmt });
    expect(onChunk).toHaveBeenCalledTimes(2);
    expect(onChunk).toHaveBeenCalledWith("hola");
    expect(onChunk).toHaveBeenCalledWith("hola");
  });

  it("should handle fetch error", async () => {
    (globalThis.fetch as any).mockResolvedValue({ body: undefined });
    const onChunk = vi.fn();
    const service = ReplicateServiceFactory.create(apiKey);
    expect(service.run({ onChunk, prompt: "hello" })).rejects.toThrowError(
      AIServiceError
    );
    expect(onChunk).not.toHaveBeenCalled();
  });

  it("should set the config by props if is passed", async () => {
    const config: IReplicateConfigProps = {
      model: "fake-model",
      temperature: 0.7,
      max_tokens: 100,
      top_p: 0.9,
      top_k: 1,
      min_new_tokens: 50,
      max_new_tokens: 200,
      repetition_penalty: 1.15,
    };
    const service = ReplicateServiceFactory.create(apiKey, config);
    expect(service.config.model).toBe(config.model);
    expect(service.config.temperature).toBe(config.temperature);
    expect(service.config.max_tokens).toBe(config.max_tokens);
    expect(service.config.top_p).toBe(config.top_p);
    expect(service.config.top_k).toBe(config.top_k);
    expect(service.config.min_new_tokens).toBe(config.min_new_tokens);
    expect(service.config.max_new_tokens).toBe(config.max_new_tokens);
    expect(service.config.repetition_penalty).toBe(config.repetition_penalty);
  });

  it("should have the defualt config if any config has passed", async () => {
    const service = ReplicateServiceFactory.create(apiKey);
    expect(service.config.model).toBe("");
    expect(service.config.temperature).toBe(0.75);
    expect(service.config.max_tokens).toBe(400);
    expect(service.config.top_p).toBe(1);
    expect(service.config.top_k).toBe(0);
    expect(service.config.min_new_tokens).toBe(50);
    expect(service.config.max_new_tokens).toBe(400);
    expect(service.config.repetition_penalty).toBe(1.15);
  });
});
