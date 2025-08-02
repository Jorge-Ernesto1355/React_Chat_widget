import { ReplicateService } from "./ReplicateServices";

export interface IReplicateServiceConfig {
  readonly model: string;
  readonly top_k: number;
  readonly top_p: number;
  readonly temperature: number;
  readonly max_new_tokens: number;
  readonly min_new_tokens: number;
  readonly repetition_penalty: number;
  readonly max_tokens: number;
  readonly apiKey: string;
}

export type IReplicateConfigProps = Omit<IReplicateServiceConfig, "apiKey">;
export class ReplicateServiceConfig {
  public readonly apiKey: string;
  public readonly model: string;
  public readonly url: string;
  public readonly top_k: number;
  public readonly top_p: number;
  public readonly temperature: number;
  public readonly max_new_tokens: number;
  public readonly min_new_tokens: number;
  public readonly repetition_penalty: number;
  public readonly max_tokens: number;
  constructor(
    apiKey: string,
    model: string,
    url: string,
    top_k: number,
    top_p: number,
    temperature: number,
    max_new_tokens: number,
    min_new_tokens: number,
    repetition_penalty: number,
    max_tokens: number
  ) {
    this.apiKey = apiKey;
    this.model = model;
    this.url = url;
    this.top_k = top_k;
    this.top_p = top_p;
    this.temperature = temperature;
    this.max_new_tokens = max_new_tokens;
    this.max_tokens = max_tokens;
    this.min_new_tokens = min_new_tokens;
    this.repetition_penalty = repetition_penalty;
  }

  static builder(): ReplicateServiceConfigBuilder {
    return new ReplicateServiceConfigBuilder();
  }
}

export class ReplicateServiceConfigBuilder {
  private apiKey: string = "";
  private model: string = "";
  private url: string =
    " https://replicate-proxy.chat-ai-widget.workers.dev/see";
  private top_k: number = 1;
  private top_p: number = 0;
  private temperature: number = 0.7;
  private max_new_tokens: number = 400;
  private max_tokens: number = 400;
  private min_new_tokens: number = 50;
  private repetition_penalty: number = 1.15;

  setApiKey(apiKey: string): this {
    this.apiKey = apiKey;
    return this;
  }

  setModel(model: string): this {
    this.model = model;
    return this;
  }

  setUrl(url: string): this {
    this.url = url;
    return this;
  }

  setTopK(top_k: number): this {
    this.top_k = top_k;
    return this;
  }
  setMaxTokens(max_tokens: number): this {
    this.max_tokens = max_tokens;
    return this;
  }
  setTopP(top_p: number): this {
    this.top_p = top_p;
    return this;
  }

  setTemperature(temperature: number): this {
    this.temperature = temperature;
    return this;
  }

  setMaxNewTokens(max: number): this {
    this.max_new_tokens = max;
    return this;
  }

  setMinNewTokens(min: number): this {
    this.min_new_tokens = min;
    return this;
  }

  setRepetitionPenalty(penalty: number): this {
    this.repetition_penalty = penalty;
    return this;
  }

  build(): ReplicateServiceConfig {
    if (!this.apiKey) throw new Error("API key is required");

    return new ReplicateServiceConfig(
      this.apiKey,
      this.model,
      this.url,
      this.top_k,
      this.top_p,
      this.temperature,
      this.max_new_tokens,
      this.min_new_tokens,
      this.repetition_penalty,
      this.max_tokens
    );
  }
}

export class ReplicateServiceFactory {
  static create(
    apiKey: string,
    config?: IReplicateConfigProps
  ): ReplicateService {
    const cfg = config ?? {
      model: "",
      url: "https://replicate-proxy.chat-ai-widget.workers.dev/see",
      top_k: 0,
      top_p: 1,
      temperature: 0.75,
      max_new_tokens: 400,
      min_new_tokens: 50,
      repetition_penalty: 1.15,
      max_tokens: 400,
    };

    const configBuilder = ReplicateServiceConfig.builder()
      .setApiKey(apiKey)
      .setModel(cfg.model)
      .setTopK(cfg.top_k)
      .setTopP(cfg.top_p)
      .setTemperature(cfg.temperature)
      .setMaxNewTokens(cfg.max_new_tokens)
      .setMinNewTokens(cfg.min_new_tokens)
      .setRepetitionPenalty(cfg.repetition_penalty)
      .setMaxTokens(cfg.max_tokens);

    return new ReplicateService(configBuilder.build());
  }
}

export function isReplicateConfig(
  config: any
): config is IReplicateServiceConfig {
  return (
    typeof config?.model === "string" &&
    typeof config?.top_k === "number" &&
    typeof config?.top_p === "number" &&
    typeof config?.temperature === "number" &&
    typeof config?.max_new_tokens === "number" &&
    typeof config?.min_new_tokens === "number" &&
    typeof config?.repetition_penalty === "number" &&
    typeof config?.max_tokens === "number"
  );
}
