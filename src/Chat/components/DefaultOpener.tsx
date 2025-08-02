import React, { useMemo } from "react";
import { getStyleDirection, type Direction } from "../utils/getStyleDirection";
import ChatBubbleIcon from "../icons/ChatBubbleIcon";
import LoaderChatInterface from "../utils/SkeletonChatInterface";

const DefaultOpener = ({
  isOpen,
  direction,
  handleClick,
  isLoading,
  Loader,
}: {
  isOpen: boolean;
  direction: Direction;
  handleClick?: () => void;
  isLoading?: boolean;
  Loader?: React.ReactNode;
}) => {
  const styleDirection = useMemo(
    () => getStyleDirection(direction),
    [direction]
  );

  const isValidLoader = React.isValidElement(Loader);
  return (
    <div
      className={`w-16 h-16 flex justify-center items-center rounded-full cursor-pointer 
        fixed ${styleDirection.bubble} -translate-x-1/2 bg-white shadow-lg
        border border-gray-200 transition-all duration-300 ease-out hover:scale-110
      `}
      data-cy="default-opener"
      tabIndex={0}
      role="button"
      aria-label="Open chat"
      aria-pressed={isOpen}
    >
      {isLoading && isValidLoader && <>{Loader}</>}
      {isLoading && !Loader && <LoaderChatInterface />}
      {!isLoading && <ChatBubbleIcon onClick={handleClick} />}
    </div>
  );
};

export default DefaultOpener;
