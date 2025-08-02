import type { ErrorType } from "../components/errors/AIErrorMessage";
import {
  NetworkError,
  RateLimitError,
  StreamingError,
  TokenExpiredError,
  AuthenticationError,
  ValidationError,
} from "../services/ErrorFactory";

const getTypeError = (error: any | null): ErrorType => {
  if (!error) return "general";

  if (error instanceof NetworkError) return "connection";
  if (error instanceof RateLimitError) return "rate_limit";
  if (error instanceof StreamingError) return "connection";
  if (error instanceof TokenExpiredError) return "token";
  if (error instanceof AuthenticationError) return "token";
  if (error instanceof ValidationError) return "general";
  if (error instanceof Error) return "general";
  return "general";
};

export default getTypeError;
