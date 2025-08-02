import WarningIcon from "../../icons/AlertTriangle";

export interface ErrorComponentProps {
  message?: string;
  details?: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorComponent: React.FC<ErrorComponentProps> = ({
  message = "Warning: No keys found",
  details = "Please check your configuration and try again.",
  onRetry,
  className = "",
}) => {
  return (
    <div
      role="alert"
      className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto ${className}`}
    >
      <div className="flex items-start space-x-3">
        <WarningIcon
          className="text-yellow-600 flex-shrink-0 mt-0.5"
          size={20}
        />
        <div className="flex-1">
          <h3
            aria-label="error message"
            className="text-yellow-800 font-semibold text-sm"
          >
            {message}
          </h3>
          {details && (
            <p
              aria-label="error details"
              className="text-yellow-700 text-sm mt-1"
            >
              {details}
            </p>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 bg-yellow-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-yellow-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorComponent;
