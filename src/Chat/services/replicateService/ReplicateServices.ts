import {
  AIServiceError,
  DefaultErrorDetector,
  ErrorFactory,
} from "../ErrorFactory";
import type { ErrorDetector } from "../huggingFace/types";
import type { AIservice, RunProps } from "../Service";
import {
  getEnhancePromptByUseCase,
  type DataProps,
} from "../utils/EnhancePrompt";
import type { IReplicateServiceConfig } from "./replicateServiceBuilder";

export class ReplicateService implements AIservice<string> {
  public readonly config: IReplicateServiceConfig;
  private errorDetector: ErrorDetector = new DefaultErrorDetector();
  constructor(config: IReplicateServiceConfig & { apiKey: string }) {
    this.config = config;
  }
  async run({ prompt, onChunk }: RunProps) {
    try {
      const body = {
        input: {
          top_k: this.config.top_k,
          top_p: this.config.top_p,
          temperature: this.config.temperature,
          max_new_tokens: this.config.max_new_tokens,
          min_new_tokens: this.config.min_new_tokens,
          repetition_penalty: this.config.repetition_penalty,
          prompt,
        },
        stream: true,
      };

      const safeOnChunk = onChunk
        ? (chunk?: string) => onChunk(chunk ?? "")
        : undefined;

      await this.startReplicateStream(
        body,
        this.config.apiKey,
        safeOnChunk as (chunk?: string) => void
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  handleStreamEvent(
    eventType: string,
    data: any,
    onChunk?: (chunk?: string) => void
  ) {
    switch (eventType) {
      case "connected":
        break;

      case "prediction_created":
        break;

      case "stream_data":
        this.proccessStreamData(data, onChunk);

        break;

      case "raw_stream":
        onChunk && onChunk(data.raw_data || "");

        break;

      case "completed":
        break;

      case "ended":
        break;

      case "error":
        throw new Error(this.parseError(data.raw || ""));
    }
  }

  private async startReplicateStream(
    payload: any,
    authToken: string,
    onChunk: (chunk?: string) => void
  ) {
    const response = await fetch(
      "https://replicate-proxy.chat-ai-widget.workers.dev/sse",
      {
        method: "POST",
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("the response does not have a body");
    }

    // Crear un reader para el stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    // Función para procesar cada evento SSE

    // Leer el stream
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const event of events) {
        if (event.trim() === "") continue;

        const { eventType, data } = this.proccesStreamSSE(event);

        if (data) {
          try {
            const parsedData = JSON.parse(data);
            this.handleStreamEvent(eventType, parsedData, onChunk);
          } catch (parseError) {
            this.handleStreamEvent(eventType, { raw: data });
          }
        }
      }
    }
  }
  public async enhancePrompt(prompt: string, data: DataProps): Promise<string> {
    const enhancePrompt = getEnhancePromptByUseCase(
      data.useCase ?? "customer-support"
    );
    const enhancedPrompt = enhancePrompt(prompt, data);

    return enhancedPrompt;
  }

  private proccesStreamSSE(eventData: string) {
    const lines = eventData.split("\n");
    let eventType = "message";
    let data = "";

    for (const line of lines) {
      if (line.startsWith("event: ")) {
        eventType = line.slice(7);
      } else if (line.startsWith("data: ")) {
        data = line.slice(6);
      }
    }

    return { eventType, data };
  }

  private proccessStreamData(data: any, onChunk?: (chunk?: string) => void) {
    if (!data || !onChunk) return;
    if (data.event === "output") {
      if (onChunk) {
        onChunk(data.data || data.output || data.text || "");
      }
    }
    if (data.event === "error") {
      throw new Error(data.data || data.output || data.text || "");
    }

    if (data.output) {
      if (onChunk) {
        onChunk(data.output);
      }
    }

    if (onChunk) {
      onChunk(data.data || data || "");
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof AIServiceError) {
      throw error;
    }
    throw this.detectAndThrowError(error);
  }

  public parseError(raw: any): string {
    try {
      const parsed = JSON.parse(raw);

      const jsonStart = parsed.error.indexOf("{");
      if (jsonStart === -1) return parsed.error || "Unknown Error";
      const jsonPart = parsed.error.slice(jsonStart);

      // Parsear el JSON
      const errorObj = JSON.parse(jsonPart);
      return errorObj.title || errorObj.detail || errorObj.status || "";
    } catch (error) {
      console.error("Error al parsear JSON", error);
      return "Something went wrong";
    }
  }

  private detectAndThrowError(error: unknown): never {
    const detectedError = this.errorDetector.detectErrorType(error);
    if (detectedError) {
      throw detectedError;
    }

    if (error instanceof Error) {
      const genericError = ErrorFactory.createGenericError(
        `Error : ${error.message}`,
        error
      );
      throw genericError;
    }

    const unknownError = ErrorFactory.createGenericError(
      "Error: An unknown error occurred"
    );
    throw unknownError;
  }
  public abort() {}
}
