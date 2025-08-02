import { useCallback, useEffect, useRef } from "react";
import type { Message } from "../types";

export const useStreamingScroll = (messages: Message[]) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  // Scroll on every message change (including content updates)
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return { containerRef, scrollToBottom };
};
