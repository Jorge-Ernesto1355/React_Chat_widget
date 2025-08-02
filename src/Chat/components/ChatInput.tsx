import { useEffect, useRef } from "react";
import ArrowUpIcon from "../icons/ArrowUpIcon";
import { useSafeStyles } from "../hooks/useSafeStyles";

interface IChatInputProps {
  onSend: (message: string) => void;
}

const ChatInput = ({ onSend = () => {} }: IChatInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { safeInputStyles, safeButtonStyles, safeFormStyles } = useSafeStyles();

  const handleSubmit = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    const message = inputRef.current?.value;
    if (message && inputRef.current) {
      onSend(message);
      inputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <form
      style={safeFormStyles}
      aria-label="chat-form"
      onSubmit={(e) => handleSubmit(e)}
      className="row-span-1 0 flex justify-center items-center p-2 space-x-2 outline-none border-t border-gray-200"
    >
      <input
        style={safeInputStyles}
        aria-label="chat-input"
        ref={inputRef}
        type="text"
        name="Type your Question"
        placeholder="Type your Question..."
        onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
        className="
        bg-gray-100
        w-full max-w-full h-[45px] px-3 py-3
        rounded-xl border-[1.5px] border-gray-300
        outline-none transition-all duration-300 ease-in-out-cubic
        shadow-xl shadow-gray-300/10

        hover:border-2 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-300/20
        active:scale-[0.95]
        focus:border-2 focus:border-gray-500
      "
      />
      <button
        style={safeButtonStyles}
        type="submit"
        aria-label="send message"
        className="w-12 h-10 border border-gray-100 rounded-full p-1 flex justify-center items-center hover:bg-gray-200 hover: transition-all duration-300 ease-out"
      >
        <ArrowUpIcon />
      </button>
    </form>
  );
};

export default ChatInput;
