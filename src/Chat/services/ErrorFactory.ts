import type { ErrorDetector } from "./huggingFace/types";

export class AIServiceError extends Error {
  public readonly code: string;
  public readonly originalError?: Error;

  constructor(message: string, code: string, originalError?: Error) {
    super(message);
    this.name = "AIServiceError";
    this.code = code;
    this.originalError = originalError;
  }
}

export class RateLimitError extends AIServiceError {
  constructor(message: string = "Rate limit exceeded") {
    super(message, "RATE_LIMIT_EXCEEDED");
  }
}

export class StreamingError extends AIServiceError {
  constructor(message: string, originalError?: Error) {
    super(message, "STREAMING_ERROR", originalError);
  }
}

export class TokenExpiredError extends AIServiceError {
  constructor(message: string = "Token expired") {
    super(message, "TOKEN_EXPIRED");
  }
}

export class AuthenticationError extends AIServiceError {
  constructor(message: string = "Authentication failed") {
    super(message, "AUTHENTICATION_ERROR");
  }
}

export class NetworkError extends AIServiceError {
  constructor(message: string, originalError?: Error) {
    super(message, "NETWORK_ERROR", originalError);
  }
}

export class ValidationError extends AIServiceError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
  }
}

export class ErrorFactory {
  static createRateLimitError(): RateLimitError {
    return new RateLimitError();
  }

  static createStreamingError(
    message: string,
    originalError?: Error
  ): StreamingError {
    return new StreamingError(message, originalError);
  }

  static createTokenExpiredError(): TokenExpiredError {
    return new TokenExpiredError();
  }

  static createAuthenticationError(): AuthenticationError {
    return new AuthenticationError();
  }

  static createNetworkError(
    message: string,
    originalError?: Error
  ): NetworkError {
    return new NetworkError(message, originalError);
  }

  static createValidationError(message: string): ValidationError {
    return new ValidationError(message);
  }

  static createGenericError(
    message: string,
    originalError?: Error
  ): AIServiceError {
    return new AIServiceError(message, "GENERIC_ERROR", originalError);
  }
}

export class DefaultErrorDetector implements ErrorDetector {
  constructor() {}

  private readonly errorPatterns: Map<string, (error: any) => AIServiceError> =
    new Map([
      // Token expired patterns
      ["token_expired", () => ErrorFactory.createTokenExpiredError()],
      ["expired", () => ErrorFactory.createTokenExpiredError()],
      ["unauthorized", () => ErrorFactory.createAuthenticationError()],
      ["authentication", () => ErrorFactory.createAuthenticationError()],
      ["invalid_token", () => ErrorFactory.createTokenExpiredError()],
      ["token has expired", () => ErrorFactory.createTokenExpiredError()],

      // Rate limit patterns
      ["rate_limit", () => ErrorFactory.createRateLimitError()],
      ["too_many_requests", () => ErrorFactory.createRateLimitError()],
      ["quota_exceeded", () => ErrorFactory.createRateLimitError()],

      // Network patterns
      [
        "network",
        (error: any) =>
          ErrorFactory.createNetworkError("Network error occurred", error),
      ],
      [
        "timeout",
        (error) => ErrorFactory.createNetworkError("Request timeout", error),
      ],
      [
        "connection",
        (error: any) =>
          ErrorFactory.createNetworkError("Connection error", error),
      ],
      [
        "econnrefused",
        (error: any) =>
          ErrorFactory.createNetworkError("Connection refused", error),
      ],

      // Validation patterns
      [
        "validation",
        (error: any) =>
          ErrorFactory.createValidationError(
            error.message || "Validation failed"
          ),
      ],
      [
        "invalid_input",
        () => ErrorFactory.createValidationError("Invalid input provided"),
      ],
    ]);

  detectErrorType(error: any): AIServiceError | null {
    if (!error) return null;

    const errorMessage = this.extractErrorMessage(error).toLowerCase();
    const errorCode = this.extractErrorCode(error);

    // Check by error code first
    if (typeof errorCode === "string") {
      for (const [pattern, factory] of this.errorPatterns) {
        if (errorCode.toLowerCase().includes(pattern)) {
          return factory(error);
        }
      }
    }

    // Check by error message
    for (const [pattern, factory] of this.errorPatterns) {
      if (errorMessage.includes(pattern)) {
        return factory(error);
      }
    }

    // Check HTTP status codes
    const statusCode = this.extractStatusCode(error);
    if (statusCode) {
      switch (statusCode) {
        case 401:
          return ErrorFactory.createTokenExpiredError();
        case 403:
          return ErrorFactory.createAuthenticationError();
        case 429:
          return ErrorFactory.createRateLimitError();
        case 400:
          return ErrorFactory.createValidationError("Bad request");
        case 408:
        case 504:
          return ErrorFactory.createNetworkError("Request timeout", error);
        case 500:
        case 502:
        case 503:
          return ErrorFactory.createNetworkError("Server error", error);
      }
    }

    return null;
  }

  private extractErrorMessage(error: any): string {
    if (typeof error === "string") return error;
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.response?.data?.error) return error.response.data.error;
    return "";
  }

  private extractErrorCode(error: any): string | null {
    if (error?.code) return error.code;
    if (error?.error?.code) return error.error.code;
    if (error?.response?.data?.code) return error.response.data.code;
    if (error?.response?.data?.error_code)
      return error.response.data.error_code;
    return null;
  }

  private extractStatusCode(error: any): number | null {
    if (error?.status) return error.status;
    if (error?.response?.status) return error.response.status;
    if (error?.statusCode) return error.statusCode;
    return null;
  }
}
