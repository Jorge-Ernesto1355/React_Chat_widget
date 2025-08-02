import { useEffect, useRef } from "react";
import { useChatContext } from "../context/Context";

const useClickOutside = (isOpen: boolean) => {
  const element = useRef<HTMLDivElement>(null);
  const onClose = useChatContext().onClose ?? (() => {});

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (element.current && !element.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  return element;
};

export default useClickOutside;
