import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AIservice, RunProps } from "../Service";
import { ERROR_CONFIG_VALIDATION, ServiceManager } from "../Service.ts";

import {
  AIServiceError,
  DefaultErrorDetector,
  ErrorFactory,
} from "../ErrorFactory.ts";
import { SimpleRateLimiter } from "../huggingFace/HuggingFaceService.ts";
import type { ConfigType } from "../../context/Context.tsx";
import { isHuggingFaceConfig } from "../huggingFace/huggingFaceBuilder.ts";

class MockService implements AIservice<string> {
  public key: string;
  public config: ConfigType | undefined;
  constructor(key: string, config?: ConfigType) {
    this.key = key;
    this.config = config;
  }

  async run(props: RunProps): Promise<void> {
    props.onChunk("test");
  }

  async enhancePrompt(prompt: string): Promise<string> {
    return `${prompt}-enhanced`;
  }
}

describe("serviceManager", () => {
  let serviceManager: ServiceManager;

  beforeEach(() => {
    (ServiceManager as any).instance = undefined;
    serviceManager = ServiceManager.getInstance();
  });

  it("should be a singleton", () => {
    const instance1 = ServiceManager.getInstance();
    const instance2 = ServiceManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  it("should register a service correctly", () => {
    serviceManager.register("huggingface", (apiKey) => new MockService(apiKey));
    const result = serviceManager.create("huggingface", "testKey");
    expect(result).toBeInstanceOf(MockService);
  });

  it("should pass the API key to the service constructor", () => {
    serviceManager.register("huggingface", (apiKey) => new MockService(apiKey));
    const result = serviceManager.create("huggingface", "testKey");
    expect((result as MockService).key).toBe("testKey");
  });

  it("should throw an error if the service is not registered", () => {
    expect(() => serviceManager.create("replicate", "testKey")).toThrowError(
      "Service replicate not registered"
    );
  });

  it("should allow the registration of multiple services", () => {
    serviceManager.register("huggingface", (apiKey) => new MockService(apiKey));
    serviceManager.register("replicate", (apiKey) => new MockService(apiKey));
    const h = serviceManager.create("huggingface", "KEY1");
    const r = serviceManager.create("replicate", "KEY2");
    expect((h as MockService).key).toBe("KEY1");
    expect((r as MockService).key).toBe("KEY2");
  });

  it("should throw an error if the services is already registered", () => {
    serviceManager.register("huggingface", (apiKey) => new MockService(apiKey));
    expect(() =>
      serviceManager.register(
        "huggingface",
        (apiKey) => new MockService(apiKey)
      )
    ).toThrowError("Service huggingface is already registered");
  });

  it("should throw  an Error  is there's a config and is not valid", () => {
    serviceManager.register("huggingface", (apiKey, config?) => {
      if (config) {
        if (isHuggingFaceConfig(config)) {
          return new MockService(apiKey, config);
        } else throw new Error(ERROR_CONFIG_VALIDATION);
      }

      return new MockService(apiKey, config);
    });

    expect(() =>
      serviceManager.create("huggingface", "testapi", {
        model: "",
      } as ConfigType)
    ).toThrow(new Error(ERROR_CONFIG_VALIDATION));
  });

  it("should return a service if the config is valid", () => {
    serviceManager.register("huggingface", (apiKey, config?) => {
      if (config) {
        if (isHuggingFaceConfig(config)) {
          return new MockService(apiKey, config);
        } else throw new Error(ERROR_CONFIG_VALIDATION);
      }

      return new MockService(apiKey);
    });

    const service = serviceManager.create("huggingface", "testapi", {
      model: "",
      temperature: 0.7,
      max_tokens: 20,
      frequency_penalty: 0.5,
      timeout: 30000,
    } as ConfigType);

    expect(service).toBeInstanceOf(MockService);
  });

  describe("Rate Limiter ", () => {
    it("Allows request up to the maximun limit within the time window", async () => {
      const rateLimiter = new SimpleRateLimiter(10, 1000);
      await rateLimiter.checkLimit();
      expect(await rateLimiter.checkLimit()).toBe(true);
      expect(rateLimiter.getRemainingRequests()).toBe(8);
    });

    it("should not allow request when has reached the maximun requests per minute", async () => {
      const rateLimiter = new SimpleRateLimiter(1, 1000);
      await rateLimiter.checkLimit();
      expect(await rateLimiter.checkLimit()).toBe(false);
      expect(rateLimiter.getRemainingRequests()).toBe(0);
    });

    it("should resets the request counter when the time window has passed", async () => {
      vi.useFakeTimers();
      const rateLimiter = new SimpleRateLimiter(1, 1000);
      expect(rateLimiter.getRemainingRequests()).toBe(1);
      vi.advanceTimersByTime(1000);
      expect(rateLimiter.getRemainingRequests()).toBe(1);
    });

    it("should initialize with requests 0", async () => {
      // Zero maxRequests
      const limiterZero = new SimpleRateLimiter(0, 1000);
      expect(await limiterZero.checkLimit()).toBe(false);
      expect(limiterZero.getRemainingRequests()).toBe(0);

      // Negative maxRequests
      const limiterNegative = new SimpleRateLimiter(-5, 1000);
      expect(await limiterNegative.checkLimit()).toBe(false);
      expect(limiterNegative.getRemainingRequests()).toBe(0);
    });
  });

  describe("Error Factory", () => {
    it("should create a genericErorr", () => {
      const error = ErrorFactory.createGenericError("Generic Error");
      expect(error).toBeInstanceOf(AIServiceError);
      expect(error.code).toBe("GENERIC_ERROR");
      expect(error.message).toBe("Generic Error");
    });

    it("should create a rate limit error with the correct code and message", () => {
      const error = ErrorFactory.createRateLimitError();
      expect(error).toBeInstanceOf(AIServiceError);
      expect(error.code).toBe("RATE_LIMIT_EXCEEDED");
      expect(error.message).toBe("Rate limit exceeded");
    });
    it("should crate a streaming error with the correct code and message", () => {
      const error = ErrorFactory.createStreamingError("Streaming Error");
      expect(error).toBeInstanceOf(AIServiceError);
      expect(error.code).toBe("STREAMING_ERROR");
      expect(error.message).toBe("Streaming Error");
    });

    it("should create a token expired error with the correct code and message", () => {
      const error = ErrorFactory.createTokenExpiredError();
      expect(error).toBeInstanceOf(AIServiceError);
      expect(error.code).toBe("TOKEN_EXPIRED");
      expect(error.message).toBe("Token expired");
    });

    it("should create an authentication error with the correct code and message", () => {
      const error = ErrorFactory.createAuthenticationError();
      expect(error).toBeInstanceOf(AIServiceError);
      expect(error.code).toBe("AUTHENTICATION_ERROR");
      expect(error.message).toBe("Authentication failed");
    });

    it("should create a network error with the correct code and message", () => {
      const error = ErrorFactory.createNetworkError("Network Error");
      expect(error).toBeInstanceOf(AIServiceError);
      expect(error.code).toBe("NETWORK_ERROR");
      expect(error.message).toBe("Network Error");
    });
  });

  describe("Error detector", () => {
    it("should detect token  expires type", () => {
      const detector = new DefaultErrorDetector();
      const tokenExpiredMessages = [
        "token_expired",
        "expired",
        "invalid_token",
        "token has expired",
      ];

      for (const msg of tokenExpiredMessages) {
        const error = { message: msg };
        const detected = detector.detectErrorType(error);
        expect(detected).toBeInstanceOf(
          ErrorFactory.createTokenExpiredError().constructor
        );
      }
    });

    it("should detect authentication type", () => {
      const detector = new DefaultErrorDetector();
      const authMessages = ["unauthorized", "authentication"];
      for (const msg of authMessages) {
        const error = { message: msg };
        const detected = detector.detectErrorType(error);
        expect(detected).toBeInstanceOf(
          ErrorFactory.createAuthenticationError().constructor
        );
      }
    });

    it("should detect rate limit type", () => {
      const detector = new DefaultErrorDetector();
      const rateLimitMessages = [
        "rate_limit",
        "too_many_requests",
        "quota_exceeded",
      ];
      for (const msg of rateLimitMessages) {
        const error = { message: msg };
        const detected = detector.detectErrorType(error);
        expect(detected).toBeInstanceOf(
          ErrorFactory.createRateLimitError().constructor
        );
      }
    });
    it("should detect network type", () => {
      const detector = new DefaultErrorDetector();
      const networkPatterns = [
        { msg: "network", expectedMsg: "Network error occurred" },
        { msg: "timeout", expectedMsg: "Request timeout" },
        { msg: "connection", expectedMsg: "Connection error" },
        { msg: "econnrefused", expectedMsg: "Connection refused" },
      ];
      for (const { msg, expectedMsg } of networkPatterns) {
        const error = { message: msg };
        const detected = detector.detectErrorType(error);
        expect(detected).toBeInstanceOf(
          ErrorFactory.createNetworkError("", undefined).constructor
        );
        expect((detected as AIServiceError).message).toBe(expectedMsg);
      }
    });

    it("should detect valiation type", () => {
      const detector = new DefaultErrorDetector();
      const validationError = { message: "validation" };
      const detectedValidation = detector.detectErrorType(validationError);
      expect(detectedValidation).toBeInstanceOf(
        ErrorFactory.createValidationError("").constructor
      );
      expect((detectedValidation as AIServiceError).message).toBe("validation");

      const invalidInputError = { message: "invalid_input" };
      const detectedInvalidInput = detector.detectErrorType(invalidInputError);
      expect(detectedInvalidInput).toBeInstanceOf(
        ErrorFactory.createValidationError("").constructor
      );
      expect((detectedInvalidInput as AIServiceError).message).toBe(
        "Invalid input provided"
      );
    });

    it("should detect status code type", () => {
      const detector = new DefaultErrorDetector();
      const statusCases = [
        { status: 401, expected: ErrorFactory.createTokenExpiredError() },
        { status: 403, expected: ErrorFactory.createAuthenticationError() },
        { status: 429, expected: ErrorFactory.createRateLimitError() },
        {
          status: 400,
          expected: ErrorFactory.createValidationError("Bad request"),
        },
        {
          status: 408,
          expected: ErrorFactory.createNetworkError("Request timeout"),
        },
        {
          status: 504,
          expected: ErrorFactory.createNetworkError("Request timeout"),
        },
        {
          status: 500,
          expected: ErrorFactory.createNetworkError("Server error"),
        },
        {
          status: 502,
          expected: ErrorFactory.createNetworkError("Server error"),
        },
        {
          status: 503,
          expected: ErrorFactory.createNetworkError("Server error"),
        },
      ];

      for (const { status, expected } of statusCases) {
        const error = { status };
        const detected = detector.detectErrorType(error);
        expect(detected).toBeInstanceOf(expected.constructor);

        if (expected instanceof AIServiceError) {
          expect((detected as AIServiceError).message).toBe(expected.message);
        }
      }

      const nestedError = { response: { status: 401 } };
      const detectedNested = detector.detectErrorType(nestedError);
      expect(detectedNested).toBeInstanceOf(
        ErrorFactory.createTokenExpiredError().constructor
      );
    });

    it("should return null if the error is undefined or null", () => {
      const detector = new DefaultErrorDetector();
      expect(detector.detectErrorType(undefined)).toBeNull();
    });

    it("should return null when the error does not match with any pattern", () => {
      const detector = new DefaultErrorDetector();
      const error = { message: "unknown error" };
      expect(detector.detectErrorType(error)).toBeNull();
    });

    it("should handle deeply nested or missing properties", () => {
      const detector = new DefaultErrorDetector();
      expect(detector.detectErrorType({})).toBeNull();

      // Null and undefined
      expect(detector.detectErrorType(undefined)).toBeNull();

      // Error with only a message deeply nested
      const errorWithDeepMessage = { error: { message: "expired" } };
      const detectedDeepMessage =
        detector.detectErrorType(errorWithDeepMessage);
      expect(detectedDeepMessage).toBeInstanceOf(
        ErrorFactory.createTokenExpiredError().constructor
      );

      // Error with only a code deeply nested
      const errorWithDeepCode = { response: { data: { code: "rate_limit" } } };
      const detectedDeepCode = detector.detectErrorType(errorWithDeepCode);
      expect(detectedDeepCode).toBeInstanceOf(
        ErrorFactory.createRateLimitError().constructor
      );

      // Error with only a status deeply nested
      const errorWithDeepStatus = { response: { status: 403 } };
      const detectedDeepStatus = detector.detectErrorType(errorWithDeepStatus);
      expect(detectedDeepStatus).toBeInstanceOf(
        ErrorFactory.createAuthenticationError().constructor
      );

      // Error with missing message, code, and status
      const errorWithNoRelevantProps = { foo: "bar" };
      expect(detector.detectErrorType(errorWithNoRelevantProps)).toBeNull();

      // Error with message in response.data.error
      const errorWithMessageInDataError = {
        response: { data: { error: "validation" } },
      };
      const detectedDataError = detector.detectErrorType(
        errorWithMessageInDataError
      );
      expect(detectedDataError).toBeInstanceOf(
        ErrorFactory.createValidationError("").constructor
      );
      expect((detectedDataError as AIServiceError).message).toBe(
        "Validation failed"
      );
    });
  });
});
