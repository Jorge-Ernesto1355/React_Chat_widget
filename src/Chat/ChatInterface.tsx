import React from "react";
import BodyComponent from "./components/Body";
import ChatInputComponent from "./components/ChatInput";
import HeaderComponent from "./components/Header";
import { useMemo, useRef } from "react";

import useAnimateChatInterface from "./hooks/useAnimateChatInterface";
import { useChatContext } from "./context/Context";
import { getStyleDirection } from "./utils/getStyleDirection";
import useClickOutside from "./hooks/useClickOutside";

const Body = React.memo(BodyComponent);
const ChatInput = React.memo(ChatInputComponent);
const Header = React.memo(HeaderComponent);

const ChatInterface = ({ isOpen }: { isOpen: boolean }) => {
  const direction = useChatContext().direction ?? "left";
  const bodyHandlerRef = useRef<(message: string) => void>(() => {});
  const { visible, rendered } = useAnimateChatInterface({ isOpen });

  const element = useClickOutside(isOpen);

  const styleDirection = useMemo(
    () => getStyleDirection(direction),
    [direction]
  );

  if (!rendered || !isOpen) return null;

  return (
    <div
      ref={element}
      role="dialog"
      aria-modal="true"
      className={`fixed grid grid-rows-8 max-h-[600px] max-w-[350px] ${
        styleDirection?.chatInterface
      } border shadow-md lg:w-1/4 md:w-2/6 sm:w-2/4 h-full rounded-lg bg-white 
        transition-all duration-300 ease-in-out transform
        ${
          visible
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
    >
      <Header />
      <Body onReady={(handler) => (bodyHandlerRef.current = handler)} />
      <ChatInput
        onSend={(msg) => {
          const sanitizedMsg = msg.replace(/<[^>]*>?/gm, "").trim();
          if (sanitizedMsg.length > 0) {
            bodyHandlerRef.current?.(sanitizedMsg);
          }
        }}
      />
      <span className="w-full text-xs flex justify-center items-center -mt-2 text-gray-500 font-medium space-x-1">
        <span>Chat Powered by</span>
        <a
          className="text-blue-500"
          href="https://www.npmjs.com/package/react-chat-ai-widget"
          target="_blank"
          rel="noreferrer"
        >
          React Chat Widget
        </a>
      </span>
    </div>
  );
};
export default ChatInterface;
