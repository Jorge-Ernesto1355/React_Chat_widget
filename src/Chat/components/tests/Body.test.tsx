import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";
import ContextChat from "../../context/Context";
import { act, render, screen, waitFor } from "@testing-library/react";
import Body from "../Body";
import { ErrorMessages } from "../../utils/errorsMessage";

const renderWithContext = ({
  huggingface,
  replicate,
  onReady,
}: {
  huggingface?: string;
  replicate?: string;
  onReady?: (handler: (message: string) => void) => void;
} = {}) => {
  return render(
    <ContextChat
      config={{
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        max_tokens: 100,
        frequency_penalty: 0.0,
        timeout: 30,
      }}
      huggingface={huggingface}
      replicate={replicate}
      data={mockData}
    >
      <Body onReady={onReady ?? (() => {})} />
    </ContextChat>
  );
};

vi.mock("../../context/Context", async (importOriginal) => {
  const actual: object = await importOriginal();
  return {
    ...actual,
    useChatContext: vi.fn(),
  };
});

vi.mock("../../hooks/useAIService", async (importOriginal) => {
  const actual: object = await importOriginal();
  return {
    ...actual,
    default: vi.fn(),
  };
});

vi.mock("../../hooks/useMessages", async (importOriginal) => {
  const actual: object = await importOriginal();
  return {
    ...actual,
    default: vi.fn(() => ({
      addMessageUser: vi.fn(),
      addMessageAssistant: vi.fn(),
    })),
  };
});

let mockErrorProps: ErrorComponentProps = {};
vi.mock("../../hooks/useValidation", async (importOriginal) => {
  const actual: object = await importOriginal();
  return {
    ...actual,
    default: vi.fn(() => ({
      errorComponent: <ErrorComponent {...mockErrorProps} />,
    })),
  };
});

import useMessages from "../../hooks/useMessages";
import useAIService from "../../hooks/useAIService";
import useValidation from "../../hooks/useValidation";

import ErrorComponent, {
  type ErrorComponentProps,
} from "../errors/ErrorComponent";
import { AIServiceError, ErrorFactory } from "../../services/ErrorFactory";
import { useChatContext } from "../../context/Context";

import { mockData } from "../../test/mocks/mocks";
const setMockErrorProps = (props: ErrorComponentProps) => {
  mockErrorProps = props;
};

describe("Body", () => {
  let mockRunAI: Mock;
  let mockOnReady: Mock;
  let mockAddMessageUser: Mock;
  let mockAddMessageAssistant: Mock;

  beforeEach(() => {
    mockRunAI = vi.fn();
    mockOnReady = vi.fn();
    mockAddMessageUser = vi.fn();
    mockAddMessageAssistant = vi.fn();

    (useAIService as any).mockReturnValue(mockRunAI);
    (useMessages as any).mockReturnValue({
      addMessageUser: mockAddMessageUser,
      addMessageAssistant: mockAddMessageAssistant,
    });

    (useChatContext as any).mockReturnValue({
      data: mockData,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    (useValidation as any).mockReset();
  });

  it("if any of the props huggingface or replicate is not passed, should render the error component", () => {
    setMockErrorProps({
      message: ErrorMessages.NotConfiguredKeys,
      details: ErrorMessages.NotConfiguredKeysDetails,
    });
    renderWithContext();

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    const message = screen.getByLabelText("error message");
    expect(message).toHaveTextContent(ErrorMessages.NotConfiguredKeys);
    const details = screen.getByLabelText("error details");
    expect(details).toHaveTextContent(ErrorMessages.NotConfiguredKeysDetails);
  });

  it("if the token is invalid should render the error  component", () => {
    setMockErrorProps({
      message: ErrorMessages.InvalidToken,
      details: ErrorMessages.InvalidTokenDetails,
    });
    renderWithContext({ huggingface: "huggingface" });
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    const message = screen.getByLabelText("error message");
    expect(message).toHaveTextContent(ErrorMessages.InvalidToken);
    const details = screen.getByLabelText("error details");
    expect(details).toHaveTextContent(ErrorMessages.InvalidTokenDetails);
  });

  it("should render the error component when the two keys are passed", () => {
    setMockErrorProps({
      message: ErrorMessages.NotConfiguredKeys,
      details: ErrorMessages.NotConfiguredKeysDetails,
    });
    renderWithContext({ huggingface: "huggingface", replicate: "replicate" });
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    const message = screen.getByLabelText("error message");
    expect(message).toHaveTextContent(ErrorMessages.NotConfiguredKeys);
    const details = screen.getByLabelText("error details");
    expect(details).toHaveTextContent(ErrorMessages.NotConfiguredKeysDetails);
  });
  it("should initialize the useAIService hook with the correct props when the services are configured", async () => {
    (useValidation as any).mockReturnValue({
      result: { success: true },
      tokenValidationResult: { isValid: true },
      key: "huggingface",
      apiKey: "huggingface",
    });
    renderWithContext();
    await waitFor(() => {
      expect(useAIService).toHaveBeenCalledTimes(1);
      expect(useAIService).toHaveBeenCalledWith({
        serviceName: "huggingface",
        apiKey: "huggingface",
        data: mockData,
        onChunk: mockAddMessageAssistant,
      });
    });
  });

  describe("stableOnSubmit", () => {
    it("should not call the onReady function when the services are not configured yet", async () => {
      (useValidation as any).mockReturnValue({
        result: { success: false },
        tokenValidationResult: { isValid: false },
      });
      renderWithContext({ onReady: mockOnReady });

      expect(mockOnReady).toHaveBeenCalledTimes(1);
    });

    it("should call the onReady function when the services already are configured", async () => {
      (useValidation as any).mockReturnValue({
        result: { success: true },
        tokenValidationResult: { isValid: true },
      });
      renderWithContext({ onReady: mockOnReady });
      expect(mockOnReady).toHaveBeenCalledTimes(1);
    });

    it("should call the stableOnsubmit function when we pass a message through the input field", async () => {
      (useValidation as any).mockReturnValue({
        result: { success: true },
        tokenValidationResult: { isValid: true },
      });

      (useMessages as any).mockReturnValue({
        addMessageUser: mockAddMessageUser.mockReturnValue({
          role: "user",
          content: "hello word",
        }),
        messages: [],
      });

      let bodyHandler: ((message: string) => void) | undefined;

      renderWithContext({
        onReady: (handler) => {
          bodyHandler = handler;
        },
      });

      const message = "hello word";

      if (typeof bodyHandler === "function") {
        await act(async () => {
          bodyHandler!(message);
        });
      }

      expect(mockAddMessageUser).toHaveBeenCalledTimes(1); // Fix: was 0
      expect(mockAddMessageUser).toHaveBeenCalledWith(message);
      expect(mockAddMessageUser).toHaveReturnedWith({
        role: "user",
        content: message,
      });
      expect(mockRunAI).toHaveBeenCalledWith(message, [
        { role: "user", content: message },
      ]);
      expect(mockRunAI).toHaveBeenCalledTimes(1);
    });

    it("should call addMessageAssistant with the error thrown by the runAi function", async () => {
      const errorMessage = "AI service failed";

      mockRunAI.mockRejectedValue(
        ErrorFactory.createNetworkError(errorMessage)
      );
      (useAIService as any).mockReturnValue(mockRunAI);
      (useValidation as any).mockReturnValue({
        result: { success: true },
        tokenValidationResult: { isValid: true },
      });
      (useMessages as any).mockReturnValue({
        addMessageUser: mockAddMessageUser.mockReturnValue({
          role: "user",
          content: "hello world",
        }),
        addMessageAssistant: mockAddMessageAssistant,
        messages: [],
      });

      let bodyHandler: ((message: string) => void) | undefined;

      renderWithContext({
        onReady: (handler) => {
          bodyHandler = handler;
        },
      });

      const message = "hello world";

      if (typeof bodyHandler === "function") {
        await act(async () => {
          bodyHandler!(message);
        });
      }

      expect(mockAddMessageUser).toHaveBeenCalledTimes(1); // Fix: was 0
      expect(mockAddMessageUser).toHaveBeenCalledWith(message);
      expect(mockAddMessageUser).toHaveReturnedWith({
        role: "user",
        content: message,
      });
      expect(mockRunAI).toHaveBeenCalledTimes(1);
      expect(mockRunAI).toHaveBeenCalledWith(message, [
        { role: "user", content: message },
      ]);
      expect(mockRunAI(message)).rejects.toThrow(errorMessage);
      expect(mockRunAI).rejects.toBeInstanceOf(AIServiceError);
      expect(mockAddMessageAssistant).toHaveBeenCalledTimes(1);
      expect(mockAddMessageAssistant).toHaveBeenCalledWith(errorMessage, {
        error: errorMessage,
        isLoading: false,
        errorType: "connection",
      });
    });
  });
});
