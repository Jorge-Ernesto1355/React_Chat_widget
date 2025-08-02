import React, {
  lazy,
  Suspense,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
const ChatInterface = lazy(() => import("../Chat/ChatInterface"));
import ContextChat, { type IContextProps } from "./context/Context";

import usePortalRef from "./hooks/usePortalRef";
import DefaultOpener from "./components/DefaultOpener";
import LoaderChatInterface from "./utils/SkeletonChatInterface";
import { getStyleDirection } from "./utils/getStyleDirection";

export const ChatWidget = ({
  direction = "left",
  children,
  Loader,
  ...props
}: IContextProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleClick = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const styleDirection = useMemo(
    () => getStyleDirection(direction),
    [direction]
  );

  const portalRef = usePortalRef();
  // Close chat when clicking outside ChatInterface

  const isValidChildren = React.isValidElement(children);

  const isValidLoader = React.isValidElement(Loader);

  const LoadingFallback = () => {
    useEffect(() => {
      setIsLoading(true);
      return () => setIsLoading(false);
    }, []);
    return <></>;
  };
  const renderChatPortal = () => {
    if (!isOpen || !portalRef) {
      return null;
    }

    return (
      <Suspense fallback={<LoadingFallback />}>
        {createPortal(<ChatInterface isOpen={isOpen} />, portalRef)}
      </Suspense>
    );
  };

  const renderCustomTrigger = () => {
    return (
      <div
        className={`w-16 h-16 flex justify-center items-center rounded-full cursor-pointer 
        fixed ${styleDirection.bubble} -translate-x-1/2 bg-white shadow-lg
        border border-gray-200 transition-all duration-300 ease-out hover:scale-110
      `}
        tabIndex={0}
        role="button"
        aria-pressed={isOpen}
        onClick={handleClick}
        data-testid="open-chat-children"
        aria-label="Open chat"
      >
        {isLoading && isValidLoader && <>{Loader}</>}
        {isLoading && !Loader && <LoaderChatInterface />}
        {!isLoading && children}
      </div>
    );
  };

  return (
    <>
      {isValidChildren ? (
        renderCustomTrigger()
      ) : (
        <DefaultOpener
          Loader={Loader}
          isOpen={isOpen}
          isLoading={isLoading}
          direction={direction}
          handleClick={handleClick}
        />
      )}

      <ContextChat direction={direction} onClose={handleClose} {...props}>
        {renderChatPortal()}
      </ContextChat>
    </>
  );
};
