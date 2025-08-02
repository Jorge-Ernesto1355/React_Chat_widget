import { describe, it, vi, beforeEach, afterEach, expect } from "vitest";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ChatWidget } from "../ChatWidget";
import { mockData } from "./mocks/mocks";

describe("ChatBubble", () => {
  let portal: HTMLElement | null = document.getElementById("portal");
  let root = document.getElementById("root");

  beforeEach(() => {
    if (!portal) {
      portal = document.createElement("div");
      portal.setAttribute("id", "portal");
      document.body.appendChild(portal);
    }
    if (!root) {
      root = document.createElement("div");
      root.setAttribute("data-testid", "root");
      document.body.appendChild(root);
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shold open the chat interface when clicked", async () => {
    render(<ChatWidget data={mockData} />);

    // Chat interface should not be visible initially

    expect(screen.queryByRole("dialog")).toBeNull();

    // Click the chat bubble icon
    const bubbleIcon = screen.getByRole("opener-chat");
    fireEvent.click(bubbleIcon);

    // Wait for the chat interface to appear
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeInTheDocument();
    });
  });

  it("should close the chat interface when clicked again", async () => {
    render(<ChatWidget data={mockData} />);

    expect(screen.queryByRole("dialog")).toBeNull();

    // Click the chat bubble icon
    const bubbleIcon = screen.getByRole("opener-chat");
    fireEvent.click(bubbleIcon);

    // Wait for the chat interface to appear
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeInTheDocument();
    });

    fireEvent.click(bubbleIcon);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("should not do anything when the portal is not found", async () => {
    render(<ChatWidget data={mockData} />);
    if (portal) document.body.removeChild(portal);

    const bubbleIcon = screen.getByRole("opener-chat");
    fireEvent.click(bubbleIcon);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      portal = document.createElement("div");
      portal.setAttribute("id", "portal");
      document.body.appendChild(portal);
    });
  });

  it("should have the direction according to the context passing by props", async () => {
    render(<ChatWidget data={mockData} direction="left" />);

    const containerBubble = screen.getByLabelText("Open chat");
    expect(containerBubble).toHaveClass("bottom-4 left-14");
  });

  it("should not render an invalid children", async () => {
    render(<ChatWidget data={mockData}>invalid children</ChatWidget>);

    const children = screen.queryByTestId("open-chat-children");
    expect(children).not.toBeInTheDocument();

    const defaultOpener = screen.queryByLabelText("Open chat");
    expect(defaultOpener).toBeInTheDocument();
  });

  it("should render the custom children when is passed", async () => {
    const CustomChildren = () => {
      return <div>Custom Children</div>;
    };
    render(
      <ChatWidget data={mockData}>
        <CustomChildren />
      </ChatWidget>
    );

    const button = screen.queryByTestId("open-chat-children");
    const children = screen.getByText("Custom Children");
    const defaultOpener = screen.queryByLabelText("Open chat");
    expect(defaultOpener).not.toBeInTheDocument();
    expect(children).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });
});
