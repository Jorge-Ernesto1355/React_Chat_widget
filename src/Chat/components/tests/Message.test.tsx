import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Message from "../Message";
import type { Message as IMessage } from "../../types";

describe("Message", () => {
  it("should render correctly", () => {
    const mockMessageProps: IMessage = {
      id: "1",
      role: "user",
      content: "Hello",
      error: null,
      isLoading: false,
    };
    render(<Message message={mockMessageProps} />);

    const message = screen.getByLabelText("message content");

    expect(message).toHaveTextContent(mockMessageProps.content);
  });

  it("should has the correct css corresponding to the role user", () => {
    let mockMessageProps: IMessage = {
      id: "1",
      role: "user",
      content: "Hello",
      error: null,
      isLoading: false,
    };
    render(<Message message={mockMessageProps} />);

    const messageContainer = screen.getByLabelText("message container");
    const messageContent = screen.getByLabelText("message content");
    const messageSubContainer = screen.getByLabelText("message sub-container");

    expect(messageContainer).toHaveClass("flex justify-end");
    expect(messageContent).toHaveClass("flex-row-reverse space-x-reverse");
    expect(messageSubContainer).toHaveClass(
      "text-black border bg-gray-100 border-gray-200"
    );
  });
  it("should has the correct css corresponding to the role assistant", () => {
    let mockMessageProps: IMessage = {
      id: "2",
      role: "assistant",
      content: "Hello",
      error: null,
      isLoading: false,
    };
    render(<Message message={mockMessageProps} />);

    const messageContainer = screen.getByLabelText("message container");
    const messageContent = screen.getByLabelText("message content");
    const messageSubContainer = screen.getByLabelText("message sub-container");

    expect(messageContainer).toHaveClass("flex justify-start");
    expect(messageContent).toHaveClass("flex-row");
    expect(messageSubContainer).toHaveClass(
      "text-black border border-gray-200"
    );
  });

  it("should render the error message correctly", () => {
    const mockMessageProps: IMessage = {
      id: "3",
      role: "user",
      content: "Hello",
      error: "Error",
      isLoading: false,
    };
    render(<Message message={mockMessageProps} />);

    const messageSubContainer = screen.queryByLabelText(
      "message sub-container"
    );
    const errorMessage = screen.getByLabelText("message error");

    expect(messageSubContainer).not.toBeInTheDocument();
    expect(errorMessage).toBeInTheDocument();
  });
});
