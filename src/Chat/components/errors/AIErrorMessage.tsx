import AIAssistantIcon from "../../icons/AIAssistantIcon";
import ClockIcon from "../../icons/ClockIcon";
import KeysIcon from "../../icons/KeysIcon";
import NotWifiIcon from "../../icons/NotWifiIcon";
import RefreshIcon from "../../icons/RefreshIcon";
import XMark from "../../icons/XMark";
import React from "react"; // React import is good practice even if not explicitly used with JSX transform

export type ErrorType = "connection" | "token" | "rate_limit" | "general";

interface AIErrorProps {
  error?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  type?: ErrorType;
  compact?: boolean;
  testId?: string;
}

const AIError: React.FC<AIErrorProps> = ({
  error,
  onRetry,
  onDismiss,
  type = "general",
  compact = false,
  testId = "ai-error",
}) => {
  const getErrorMessage = () => {
    if (error) return error;

    switch (type) {
      case "connection":
        return "Connection error with AI";
      case "token":
        return "Invalid or expired API token";
      case "rate_limit":
        return "Request limit exceeded";
      default:
        return "AI could not process your request";
    }
  };

  const getErrorIcon = () => {
    const iconProps = {
      size: compact ? 16 : 20,
      className: "text-red-500",
      color: "#ef4444", // Tailwind's red-500 hex
    };

    switch (type) {
      case "connection":
        return (
          <NotWifiIcon
            {...iconProps}
            data-testid={`${testId}-icon-connection`}
          />
        );
      case "token":
        return <KeysIcon {...iconProps} data-testid={`${testId}-icon-token`} />;
      case "rate_limit":
        return (
          <ClockIcon {...iconProps} data-testid={`${testId}-icon-rate-limit`} />
        );
      default:
        return (
          <AIAssistantIcon
            {...iconProps}
            data-testid={`${testId}-icon-general`}
          />
        );
    }
  };

  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-2 bg-red-50 border rounded-xl border-red-200 px-3 py-1.5 text-sm"
        data-testid={`${testId}-compact`}
        role="alert"
        aria-live="polite"
      >
        {getErrorIcon()}
        <span
          className="text-red-700"
          data-testid={`${testId}-message`}
          aria-label="error message"
        >
          {getErrorMessage()}
        </span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-red-600 hover:text-red-800 ml-1 p-1 rounded hover:bg-red-100 transition-colors"
            title="Retry"
            data-testid={`${testId}-retry-button`}
            aria-label="Retry request"
          >
            <RefreshIcon />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="bg-red-50 border border-red-200 rounded-lg p-4 my-2 max-w-md"
      data-testid={testId}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getErrorIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4
              className="text-red-800 font-medium text-sm"
              data-testid={`${testId}-title`}
            >
              AI Error
            </h4>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-100 transition-colors"
                data-testid={`${testId}-dismiss-button`}
                aria-label="Dismiss error"
              >
                <XMark />
              </button>
            )}
          </div>

          <p
            className="text-red-700 text-sm mb-3"
            data-testid={`${testId}-message`}
          >
            {getErrorMessage()}
          </p>

          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              data-testid={`${testId}-retry-button`}
              aria-label="Try again"
            >
              <RefreshIcon />
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIError;
