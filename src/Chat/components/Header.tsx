import XMark from "../icons/XMark";
import AIAssistantIcon from "../icons/AIAssistantIcon";
import { useChatContext } from "../context/Context";
import { validateExclusiveKeys } from "../utils/chooseServiceByProps";

import clsx from "clsx";
import { useSafeStyles } from "../hooks/useSafeStyles";

const Header = () => {
  const onClose = useChatContext().onClose ?? (() => {});
  const { huggingface, replicate } = useChatContext();
  const title = useChatContext().title ?? "AI Assistant";
  const result = validateExclusiveKeys({ huggingface, replicate });

  const { safeHeaderStyles, safeHeaderClassName } = useSafeStyles();

  return (
    <header
      style={safeHeaderStyles}
      role="banner"
      aria-label="Chat header"
      className={clsx(
        safeHeaderClassName,
        "w-full border-b p-2 row-span-1 flex justify-start items-center"
      )}
    >
      <div className="flex justify-between w-full items-center">
        <div>
          <div
            className="flex space-x-3 items-center"
            aria-label="Chat assistant title"
          >
            <AIAssistantIcon aria-hidden="true" />
            <h1
              aria-label="header-title"
              className="font-inter text-lg font-semibold"
            >
              {title}
            </h1>
          </div>
          {result.success && (
            <div
              className="flex items-center space-x-1 ml-9"
              aria-label="Powered by information"
              data-testid="powered-by"
            >
              <span className="text-xs text-gray-500 font-medium">
                Powered by
              </span>
              <span
                aria-label="service name"
                className="text-xs font-semibold text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full"
              >
                {result.key.charAt(0).toUpperCase() + result.key.slice(1)}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center mr-5 ">
          <button
            onClick={() => {
              onClose();
            }}
            className="cursor-pointer mr-5"
            aria-label="Close chat"
          >
            <XMark aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
