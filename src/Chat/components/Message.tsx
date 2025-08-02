import ThinkingTextAnimation from "../icons/thinkingTextAnimation";
import type { Message as IMessage } from "../types";
import AIError, { type ErrorType } from "./errors/AIErrorMessage";

const Message: React.FC<{ message: IMessage }> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div
      aria-label="message container"
      className={`flex ${isUser ? "justify-end" : "justify-start"} last:mb-5`}
    >
      <div
        aria-label="message content"
        className={`flex items-start space-x-2 max-w-3xl ${
          isUser ? "flex-row-reverse space-x-reverse" : "flex-row"
        }`}
      >
        <MessageConditional
          message={message}
          isUser={isUser}
          onRetry={() => window.location.reload()}
        />
      </div>
    </div>
  );
};

export default Message;
const ErrorMessage = ({
  error,
  onRetry,
  errorType,
}: {
  error: string;
  onRetry: () => void;
  errorType: ErrorType;
}) => {
  return (
    <div className="ml-2 max-w-sm" aria-label="message error">
      <AIError
        error={error}
        type={errorType}
        onRetry={onRetry}
        compact={true} // Para errores inline
      />
    </div>
  );
};

const NormalMessage = ({
  content,
  isLoading,
  isUser,
}: {
  content: string;
  isLoading: boolean | undefined;
  isUser: boolean;
}) => (
  <div
    aria-label="message sub-container"
    className={`rounded-xl px-4 py-1 shadow-sm m-2 ${
      isUser
        ? " text-black border bg-gray-100 border-gray-200"
        : "text-black  border border-gray-200"
    }`}
  >
    <div className="whitespace-pre-wrap break-words font-inter flex flex-col items-center justify-center">
      {isLoading ? (
        <span className="flex justify-center items-center">
          <ThinkingTextAnimation />
        </span>
      ) : (
        <div
          aria-label="message text"
          dangerouslySetInnerHTML={{ __html: formatAIResponse(content) }}
        />
      )}
    </div>
  </div>
);

const MessageConditional = ({
  message,
  isUser,
  onRetry,
}: {
  message: IMessage;
  isUser: boolean;
  onRetry: () => void;
}) => {
  return message.error ? (
    <ErrorMessage
      errorType={message.errorType || "general"}
      error={message.error}
      onRetry={onRetry}
    />
  ) : (
    <NormalMessage
      content={message.content}
      isLoading={message.isLoading}
      isUser={isUser}
    />
  );
};
const formatAIResponse = (rawResponse: string): string => {
  // Remove </think> tags and "Response:" prefix
  let cleaned = rawResponse
    .replace(/<\/think>/g, "")
    .replace(/^Response:\s*/i, "")
    .replace(/Response:\s*/gi, "")
    .trim();

  // Remove excessive bullet points and asterisks
  cleaned = cleaned
    .replace(/^\s*[•*-]\s*/gm, "")
    .replace(/\*\s*•\s*/g, "")
    .trim();

  let formatted = "";

  // Extract and format title/main topic from various patterns
  const titlePatterns = [
    /(?:hours of operation|contact information|about|information)\s+for\s+(\w+)/i,
    /(\w+)\s+(?:hours of operation|contact information|about|information)/i,
    /The\s+.*?\s+for\s+(\w+)/i,
  ];

  let titleMatch = null;
  for (const pattern of titlePatterns) {
    titleMatch = cleaned.match(pattern);
    if (titleMatch) break;
  }

  if (titleMatch) {
    formatted += `<h1 class="text-xl font-bold text-gray-800 -mb-7 ">${titleMatch[1]} Information</h1>\n\n`;
    // Remove the title part from content
    cleaned = cleaned.replace(titleMatch[0], "").trim();
  }

  // Remove duplicate confidence mentions and clean up
  cleaned = cleaned
    .replace(/🟢\s*\*?\*?(High|Medium|Low)\s*confidence\*?\*?\.?\s*/gi, "")
    .replace(/\*?\*?(High|Medium|Low)\s*confidence\*?\*?\.?\s*/gi, "")
    .replace(/\.\s*directly sourced/gi, "directly sourced")
    .replace(/\.\s*\*?This information/gi, ". This information")
    .replace(/The\s+are\s+/gi, "")
    .trim();

  // Extract main content (before source and closing)
  let mainContent = cleaned
    .replace(/\*?This information is.*?\*?/gi, "")
    .replace(/---.*Let me know.*$/gi, "")
    .replace(/Let me know if you have.*?[!?.]/gi, "")
    .trim();

  // Format hours/time information
  mainContent = mainContent.replace(
    /(\w+\s+to\s+\w+):\s*(\d+:\d+\s*(?:AM|PM))\s*-\s*(\d+:\d+\s*(?:AM|PM))/gi,
    '<p class="text-lg text-gray-700 "><strong class="text-gray-900">$1:</strong> $2 - $3</p>'
  );

  // If no specific hours format found, wrap main content in paragraph
  if (mainContent && !mainContent.includes("<p>")) {
    mainContent = `<p class="text-gray-700 ">${mainContent}</p>`;
  }

  if (mainContent) {
    formatted += mainContent;
  }

  // Extract source information (only once)
  const sourceMatch = cleaned.match(
    /\*?(This information is.*?(?:knowledge base|database|source)[^.]*\.)\*?/i
  );
  if (sourceMatch) {
    formatted += `\n\n<small class="text-sm text-gray-500 italic block ">${sourceMatch[1]}</small>`;
  }

  // Extract closing message
  const closingMatch = cleaned.match(/Let me know if you have.*?[!?.]/i);
  if (closingMatch) {
    formatted += `\n\n<hr class="border-gray-300 ">\n\n<p class="text-gray-600 text-sm">${closingMatch[0]}</p>`;
  }

  return formatted.trim();
};
