export const INFERENCE_PROVIDERS = [
  "black-forest-labs",
  "cerebras",
  "cohere",
  "fal-ai",
  "featherless-ai",
  "fireworks-ai",
  "groq",
  "hf-inference",
  "hyperbolic",
  "nebius",
  "novita",
  "nscale",
  "openai",
  "ovhcloud",
  "replicate",
  "sambanova",
  "together",
] as const;

export interface IHuggingFaceConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  timeout: number;
  frequency_penalty: number;
}

export type SupportedChatProvider = (typeof INFERENCE_PROVIDERS)[number];

export class HuggingFaceConfig {
  public readonly apiKey?: string;
  public readonly model: string;
  public readonly frecuency_penalty?: number;
  public readonly temperature: number;
  public readonly max_tokens: number;
  public readonly timeout: number;

  constructor(
    apiKey: string,
    model: string,
    frecuency_penalty: number,
    temperature: number,
    max_tokens: number,
    timeout: number
  ) {
    this.apiKey = apiKey;
    this.model = model;
    this.frecuency_penalty = 0.5; // Default value
    this.temperature = temperature;
    this.max_tokens = max_tokens;
    this.timeout = timeout;
    this.frecuency_penalty = frecuency_penalty;
  }

  static builder(): HuggingFaceConfigBuilder {
    return new HuggingFaceConfigBuilder();
  }
}

export class HuggingFaceConfigBuilder {
  private apiKey: string = "";
  private model: string = "";
  private temperature: number = 0.7;
  private max_tokens: number = 20;
  private frequency_penalty: number = 0.5;
  private timeout: number = 30000;

  setApiKey(apiKey: string): this {
    this.apiKey = apiKey;
    return this;
  }

  setFrequencyPenalty(frequency_penalty: number): this {
    this.frequency_penalty = frequency_penalty;
    return this;
  }

  setModel(model: string): this {
    this.model = model;
    return this;
  }

  setTemperature(temperature: number): this {
    this.temperature = temperature;
    return this;
  }

  setMaxTokens(max_tokens: number): this {
    this.max_tokens = max_tokens;
    return this;
  }

  setTimeout(timeout: number): this {
    this.timeout = timeout;
    return this;
  }

  build(): HuggingFaceConfig {
    if (!this.apiKey) {
      throw new Error("API key is required");
    }
    return new HuggingFaceConfig(
      this.apiKey,
      this.model,
      this.frequency_penalty,
      this.temperature,
      this.max_tokens,
      this.timeout
    );
  }
}

export function isHuggingFaceConfig(config: any): config is IHuggingFaceConfig {
  return (
    typeof config?.model === "string" &&
    typeof config?.temperature === "number" &&
    typeof config?.max_tokens === "number" &&
    typeof config?.timeout === "number" &&
    typeof config?.frequency_penalty === "number"
  );
}
