import { useChatContext } from "../context/Context";

const InitialQuestions = ({
  onSendMessage,
}: {
  onSendMessage: (question: string) => void;
}) => {
  const { initialQuestions } = useChatContext();
  if (!initialQuestions) return null;

  return (
    <ul
      aria-label="initial-questions"
      className={`w-fit bg-white shadow-md rounded-xl mr-3  mt-2 ml-2 max-h-96 overflow-y-auto border-gray-200 border transition-all duration-300 ease-in-out transform`}
    >
      {initialQuestions.map((question, index) => (
        <li key={index} role="listitem" className="p-2 border-b">
          <button
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onSendMessage(question.question);
              }
            }}
            type="button"
            className="w-full text-left hover:bg-gray-50 cursor-pointer whitespace-pre-wrap break-words text-gray-700 text-sm p-2"
            onClick={() => onSendMessage(question.question)}
          >
            {question.question}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default InitialQuestions;
