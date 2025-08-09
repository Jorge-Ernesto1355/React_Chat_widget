import Message from "../components/Message";
import type { Message as IMessage } from "../types";
import { useStreamingScroll } from "../hooks/useStreamingScroll";
import { useSafeStyles } from "../hooks/useSafeStyles";
import clsx from "clsx";
import { useState } from "react";
import InitialQuestions from "../components/InitialQuestions";
import { useChatContext } from "../context/Context";

const SmartAutoScrollMessages = ({
  messages = [],
  onSendMessage,
}: {
  messages: IMessage[];
  onSendMessage: (question: string) => void;
}) => {
  const { containerRef } = useStreamingScroll(messages);
  const { safeChatStyles, safeChatClassName } = useSafeStyles();

  const [isVisible, setIsVisible] = useState(true);

  const questions = useChatContext();
  console.log(questions);
  const handleSendMessage = (question: string) => {
    setIsVisible(false);
    onSendMessage(question);
  };

  return (
    <div
      style={safeChatStyles}
      ref={containerRef}
      role="messages"
      className={clsx(
        safeChatClassName,
        "row-span-6 overflow-hidden overflow-y-auto"
      )}
    >
      {messages?.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      {isVisible && questions && (
        <InitialQuestions onSendMessage={handleSendMessage} />
      )}
    </div>
  );
};

export default SmartAutoScrollMessages;
