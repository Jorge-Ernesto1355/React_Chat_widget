import { fireEvent, render, screen } from "@testing-library/react";
import ChatInput from "../ChatInput";
import { describe, expect, it, vi } from "vitest";
import ContextChat from "../../context/Context";
import { mockData } from "../../test/mocks/mocks";

function renderWithContext(onSend?: any) {
  return render(
    <ContextChat data={mockData}>
      <ChatInput onSend={onSend ?? (() => {})} />
    </ContextChat>
  );
}

describe("ChatInput", () => {
  it("should render the chat input component", () => {
    renderWithContext();

    const input = screen.getByRole("textbox");
    const submitButton = screen.getByRole("button");
    expect(input).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it("should be focus when the component is mounted", () => {
    renderWithContext();
    const input = screen.getByRole("textbox");
    expect(input).toHaveFocus();
  });

  it("message is sent when user submits the form by clicking the send button", async () => {
    const mockOnSend = vi.fn();
    renderWithContext(mockOnSend);
    const input = screen.getByRole("textbox");
    const submitButton = screen.getByRole("button");
    fireEvent.change(input, { target: { value: "Hello world" } });
    fireEvent.click(submitButton);
    expect(mockOnSend).toHaveBeenCalledTimes(1);
    expect(mockOnSend).toHaveBeenCalledWith("Hello world");
  });

  it("message is sent when user submits the form by pressing Enter", async () => {
    const mockOnSend = vi.fn();
    renderWithContext(mockOnSend);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Hello world" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    expect(mockOnSend).toHaveBeenCalledTimes(1);
    expect(mockOnSend).toHaveBeenCalledWith("Hello world");
  });

  it("message is not sent when user submits the form by pressing Enter and the input is empty", async () => {
    const mockOnSend = vi.fn();
    renderWithContext(mockOnSend);
    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    expect(mockOnSend).toHaveBeenCalledTimes(0);
  });

  it("should clear the input field after sending message", () => {
    const mockOnSend = vi.fn();
    renderWithContext(mockOnSend);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Hello world" } });
    fireEvent.click(screen.getByRole("button"));
    expect(input).toHaveValue("");
    expect(mockOnSend).toHaveBeenCalledWith("Hello world");
  });
});
