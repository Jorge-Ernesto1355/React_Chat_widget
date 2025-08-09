import type { ErrorType } from "./components/errors/AIErrorMessage";

export interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
  error: string | null;
  isLoading?: boolean;
  className?: string;
  errorType?: ErrorType;
}

export const Role = {
  User: "user",
  Assistant: "assistant",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

interface StylesPropsP {
  formStyles: {
    inputStyles?: React.CSSProperties;
    buttonStyles?: React.CSSProperties;
    formStyles?: React.CSSProperties;
  };
  chatClassName: string;
  chatStyles: React.CSSProperties;
  headerClassName: string;
  headerStyles: React.CSSProperties;
}

export type InitialQuestions = Array<{ question: string }>;

export type StylesProps = Partial<StylesPropsP>;
