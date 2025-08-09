import React, { useMemo } from "react";
import type { Direction } from "../utils/getStyleDirection";
import type { DataProps } from "../services/utils/EnhancePrompt";
import type { InitialQuestions, StylesProps } from "../types";
import type { IReplicateConfigProps } from "../services/replicateService/replicateServiceBuilder";
import type { IHuggingFaceConfig } from "../services/huggingFace/huggingFaceBuilder";

export type ConfigType = IReplicateConfigProps | IHuggingFaceConfig;

const Context = React.createContext<IContextProps | null>(null);

type ContextOptionals = Partial<{
  huggingface: string;
  replicate: string;
  onClose: () => void;
  direction: Direction;
  title: string;
  config: ConfigType;
  children: React.ReactNode;
  Loader: React.ReactNode;
  initialQuestions: InitialQuestions;
}>;

export type IContext = StylesProps &
  ContextOptionals & {
    data: DataProps;
  };

export type IContextProps = Omit<IContext, "onClose">;

type IContextValues = IContext & {
  children: React.ReactNode;
};

export const ContextChat = ({
  children,
  direction = "left",
  onClose = () => {},
  ...props
}: IContextValues) => {
  const values: IContextProps = useMemo(() => {
    return {
      onClose,
      direction: direction || "left",
      ...props,
    };
  }, [props, direction, onClose]);

  return <Context.Provider value={values}>{children}</Context.Provider>;
};

export default ContextChat;

export const useChatContext = (): IContext => {
  const rawContext = React.useContext<IContext | null>(Context);
  const context = React.useMemo(() => rawContext, [rawContext]);
  if (context === null) {
    throw new Error("useChatContext must be used within a `Context` provider");
  }
  return context;
};
