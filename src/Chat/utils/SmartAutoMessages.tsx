import Message from "../components/Message";
import type { Message as IMessage } from "../types";
import { useStreamingScroll } from "../hooks/useStreamingScroll";
import { useSafeStyles } from "../hooks/useSafeStyles";
import clsx from "clsx";

const SmartAutoScrollMessages = ({
  messages = [],
}: {
  messages: IMessage[];
}) => {
  const { containerRef } = useStreamingScroll(messages);
  const { safeChatStyles, safeChatClassName } = useSafeStyles();

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
    </div>
  );
};

export default SmartAutoScrollMessages;
