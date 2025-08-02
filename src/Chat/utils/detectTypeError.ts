export function detectErrorType(
  message: string
): "connection" | "token" | "rate_limit" | "general" {
  if (message.includes("connect")) return "connection";
  if (message.includes("token")) return "token";
  if (message.includes("limit")) return "rate_limit";
  return "general";
}
