import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import ChatInterface from "../ChatInterface";
import ContextChat, { type IContext } from "../context/Context";
import { LeftDirection, RightDirection } from "../utils/getStyleDirection";
import type { Message } from "../types";

vi.mock("../hooks/useAIService", async (importOriginal) => {
  const actual: object = await importOriginal();
  return {
    ...actual,
    default: vi.fn(),
  };
});

// Mocks
vi.mock("../hooks/useValidation", async (importOriginal) => {
  const actual: object = await importOriginal();
  return {
    ...actual,
    default: vi.fn(() => ({
      result: { success: true },
      tokenValidationResult: { isValid: true },
      key: "huggingface",
      apiKey: "huggingface",
    })),
  };
});

vi.mock("../hooks/useMessages", async (importOriginal) => {
  const actual: object = await importOriginal();
  return {
    ...actual,
    default: vi.fn(() => {
      return {
        addMessageUser: vi.fn(),
        addMessageAssistant: vi.fn(),
        messages: [],
      };
    }),
  };
});

vi.mock("../hooks/useAnimateChatInterface", async (importOriginal) => {
  const actual: object = await importOriginal();
  return {
    ...actual,
    default: vi.fn(() => ({ visible: true, rendered: true })),
  };
});

// Imports después de los mocks
import useMessages from "../hooks/useMessages";
import useAnimateChatInterface from "../hooks/useAnimateChatInterface";
import useValidation from "../hooks/useValidation";
import useAIService from "../hooks/useAIService";
import { ErrorFactory } from "../services/ErrorFactory";
import { mockData } from "./mocks/mocks";

// Utilidad para renderizar el componente con contexto
type renderWithContextProps = IContext & {
  isOpen: boolean;
};

export const renderWithContext = ({
  isOpen,
  direction = "left",
}: renderWithContextProps) => {
  return render(
    <ContextChat direction={direction} data={mockData}>
      <ChatInterface isOpen={isOpen} />
    </ContextChat>
  );
};

describe("Chat Interface", () => {
  let addMessageAssistant: Mock;
  let addMessageUser: Mock;
  let mockMessages: Message[] = [];
  let mockRunAI: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    addMessageAssistant = vi.fn();
    addMessageUser = vi.fn();
    mockRunAI = vi.fn();
    mockMessages = [];
    mockMessages.push({ role: "user", content: "hello", id: "e", error: null });
    (useAIService as any).mockReturnValue(mockRunAI);
    const mockedUseMessages = useMessages as unknown as Mock;

    mockedUseMessages.mockReturnValue({
      addMessageUser,
      addMessageAssistant,
      messages: mockMessages,
    });

    (useAnimateChatInterface as any).mockReturnValue({
      visible: true,
      rendered: true,
    });

    (useValidation as any).mockReturnValue({
      result: { success: true },
      tokenValidationResult: { isValid: true },
      key: "huggingface",
      apiKey: "huggingface",
    });
  });

  it("should not contain the class when visible is false", () => {
    (useAnimateChatInterface as any).mockReturnValue({
      visible: false,
      rendered: true,
    });

    renderWithContext({ isOpen: true, data: mockData });

    expect(screen.getByRole("dialog")).toHaveClass(
      "opacity-0 scale-95 pointer-events-none"
    );
  });

  it("should render chat interface when isOpen is true", () => {
    renderWithContext({ isOpen: true, data: mockData });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should not render chat interface when isOpen is false", () => {
    renderWithContext({ isOpen: false, data: mockData });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should render with the correct direction class (left)", () => {
    renderWithContext({ isOpen: true, direction: "left", data: mockData });
    expect(screen.getByRole("dialog")).toHaveClass(LeftDirection.chatInterface);
  });

  it("should render with the correct direction class (right)", () => {
    renderWithContext({ isOpen: true, direction: "right", data: mockData });
    expect(screen.getByRole("dialog")).toHaveClass(
      RightDirection.chatInterface
    );
  });

  it("should not render if rendered is false", () => {
    (useAnimateChatInterface as any).mockReturnValue({
      visible: false,
      rendered: false,
    });

    renderWithContext({ isOpen: true, data: mockData });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should apply visible styles when visible is true", () => {
    (useAnimateChatInterface as any).mockReturnValue({
      visible: true,
      rendered: true,
    });

    renderWithContext({ isOpen: true, data: mockData });

    expect(screen.getByRole("dialog")).toHaveClass("opacity-100 scale-100");
  });

  it("should render the error message when the service fails", async () => {
    (useAIService as any).mockReturnValue(
      mockRunAI.mockRejectedValue(
        ErrorFactory.createNetworkError("network error")
      )
    );
    (useMessages as any).mockReturnValue({
      addMessageUser: addMessageUser.mockImplementation((message) => {
        const messageObject: Message = {
          role: "user",
          content: message,
          id: "e",
          error: "network error",
          errorType: "connection",
        };
        mockMessages.push(messageObject);
        return {
          role: "user",
          content: message,
        };
      }),
      addMessageAssistant: addMessageAssistant,
      messages: [
        ...mockMessages,
        {
          role: "user",
          content: "Hello world",
          id: "e",
          error: "network error",
          errorType: "connection",
        },
      ],
    });

    renderWithContext({ isOpen: true, data: mockData });

    const input = screen.getByRole("textbox");
    const submitButton = screen.getByLabelText("send message");

    const message = "Hello world";
    await act(async () => {
      fireEvent.change(input, { target: { value: message } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByLabelText("error message")).toHaveTextContent(
        "network error"
      );
    });
  });

  it("should create a message when the user sends a message", async () => {
    const messageText = "hello world";
    const message: Message = {
      role: "user",
      content: messageText,
      id: "e",
      error: null,
    };
    (useMessages as any).mockReturnValue({
      addMessageUser: addMessageUser.mockImplementation(() => {
        mockMessages.push(message);
        return message;
      }),
      addMessageAssistant: addMessageAssistant,
      get messages() {
        return [...mockMessages, message];
      },
    });

    renderWithContext({ isOpen: true, data: mockData });

    const input = screen.getByRole("textbox");
    const submitButton = screen.getByLabelText("send message");

    await act(async () => {
      fireEvent.change(input, { target: { value: messageText } });
      fireEvent.click(submitButton);
    });

    expect(addMessageUser).toHaveBeenCalledTimes(1);
    expect(addMessageUser).toHaveBeenCalledWith(messageText);

    await waitFor(() => {
      expect(mockMessages).toHaveLength(2);
      expect(mockMessages[0].role).toBe("user");
      expect(mockMessages[0].content).toBe("hello");
      expect(mockMessages[1].role).toBe("user");
      expect(mockMessages[1].content).toBe(messageText);

      const userMessages = screen.getAllByLabelText("message text");
      expect(userMessages).toHaveLength(2);
      expect(userMessages[0]).toHaveTextContent("hello");
      expect(userMessages[1]).toHaveTextContent(messageText);
    });

    expect(mockRunAI).toHaveBeenCalledTimes(1);
    expect(mockRunAI).toHaveBeenCalledWith(messageText, [
      ...mockMessages,
      message,
    ]);
  });
});
