import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import AIError from "../AIErrorMessage";

describe("AIError Component", () => {
  beforeEach(() => {
    cleanup();
  });

  describe("Basic Rendering", () => {
    it("renders with default props", () => {
      render(<AIError />);

      expect(screen.getByTestId("ai-error")).toBeInTheDocument();
      expect(screen.getByTestId("ai-error-message")).toHaveTextContent(
        "AI could not process your request"
      );
      expect(screen.getByTestId("ai-error-title")).toHaveTextContent(
        "AI Error"
      );
      expect(screen.getByTestId("ai-error-icon-general")).toBeInTheDocument();
    });

    it("renders with custom error message", () => {
      const customError = "Custom error message";
      render(<AIError error={customError} />);

      expect(screen.getByTestId("ai-error-message")).toHaveTextContent(
        customError
      );
    });

    it("renders with custom testId", () => {
      render(<AIError testId="custom-error" />);

      expect(screen.getByTestId("custom-error")).toBeInTheDocument();
      expect(screen.getByTestId("custom-error-message")).toBeInTheDocument();
      expect(screen.getByTestId("custom-error-title")).toBeInTheDocument();
    });
  });

  describe("Error Types", () => {
    it("renders connection error correctly", () => {
      render(<AIError type="connection" />);

      expect(screen.getByTestId("ai-error-message")).toHaveTextContent(
        "Connection error with AI"
      );
      expect(
        screen.getByTestId("ai-error-icon-connection")
      ).toBeInTheDocument();
    });

    it("renders token error correctly", () => {
      render(<AIError type="token" />);

      expect(screen.getByTestId("ai-error-message")).toHaveTextContent(
        "Invalid or expired API token"
      );
      expect(screen.getByTestId("ai-error-icon-token")).toBeInTheDocument();
    });

    it("renders rate limit error correctly", () => {
      render(<AIError type="rate_limit" />);

      expect(screen.getByTestId("ai-error-message")).toHaveTextContent(
        "Request limit exceeded"
      );
      expect(
        screen.getByTestId("ai-error-icon-rate-limit")
      ).toBeInTheDocument();
    });

    it("renders general error correctly", () => {
      render(<AIError type="general" />);

      expect(screen.getByTestId("ai-error-message")).toHaveTextContent(
        "AI could not process your request"
      );
      expect(screen.getByTestId("ai-error-icon-general")).toBeInTheDocument();
    });

    it("custom error message overrides type-based message", () => {
      const customError = "Custom error overrides type";
      render(<AIError type="connection" error={customError} />);

      expect(screen.getByTestId("ai-error-message")).toHaveTextContent(
        customError
      );
      expect(screen.getByTestId("ai-error-message")).not.toHaveTextContent(
        "Error de conexión con la IA"
      );
    });
  });

  describe("Compact Mode", () => {
    it("renders compact version when compact=true", () => {
      render(<AIError compact />);

      expect(screen.getByTestId("ai-error-compact")).toBeInTheDocument();
      expect(screen.queryByTestId("ai-error")).not.toBeInTheDocument();
      expect(screen.queryByTestId("ai-error-title")).not.toBeInTheDocument();
    });

    it("renders regular version when compact=false", () => {
      render(<AIError compact={false} />);

      expect(screen.getByTestId("ai-error")).toBeInTheDocument();
      expect(screen.queryByTestId("ai-error-compact")).not.toBeInTheDocument();
      expect(screen.getByTestId("ai-error-title")).toBeInTheDocument();
    });

    it("compact mode shows correct icon and message", () => {
      render(<AIError type="token" compact />);

      expect(screen.getByTestId("ai-error-compact")).toBeInTheDocument();
      expect(screen.getByTestId("ai-error-icon-token")).toBeInTheDocument();
      expect(screen.getByTestId("ai-error-message")).toHaveTextContent(
        "Invalid or expired API token"
      );
    });
  });

  describe("Retry Functionality", () => {
    it("renders retry button when onRetry is provided", () => {
      const onRetry = vi.fn();
      render(<AIError onRetry={onRetry} />);

      expect(screen.getByTestId("ai-error-retry-button")).toBeInTheDocument();
    });

    it("does not render retry button when onRetry is not provided", () => {
      render(<AIError />);

      expect(
        screen.queryByTestId("ai-error-retry-button")
      ).not.toBeInTheDocument();
    });

    it("calls onRetry when retry button is clicked", () => {
      const onRetry = vi.fn();
      render(<AIError onRetry={onRetry} />);

      fireEvent.click(screen.getByTestId("ai-error-retry-button"));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("renders retry button in compact mode", () => {
      const onRetry = vi.fn();
      render(<AIError onRetry={onRetry} compact />);

      expect(screen.getByTestId("ai-error-retry-button")).toBeInTheDocument();
    });

    it("calls onRetry in compact mode", () => {
      const onRetry = vi.fn();
      render(<AIError onRetry={onRetry} compact />);

      fireEvent.click(screen.getByTestId("ai-error-retry-button"));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe("Dismiss Functionality", () => {
    it("renders dismiss button when onDismiss is provided", () => {
      const onDismiss = vi.fn();
      render(<AIError onDismiss={onDismiss} />);

      expect(screen.getByTestId("ai-error-dismiss-button")).toBeInTheDocument();
    });

    it("does not render dismiss button when onDismiss is not provided", () => {
      render(<AIError />);

      expect(
        screen.queryByTestId("ai-error-dismiss-button")
      ).not.toBeInTheDocument();
    });

    it("calls onDismiss when dismiss button is clicked", () => {
      const onDismiss = vi.fn();
      render(<AIError onDismiss={onDismiss} />);

      fireEvent.click(screen.getByTestId("ai-error-dismiss-button"));
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("does not render dismiss button in compact mode", () => {
      const onDismiss = vi.fn();
      render(<AIError onDismiss={onDismiss} compact />);

      expect(
        screen.queryByTestId("ai-error-dismiss-button")
      ).not.toBeInTheDocument();
    });
  });

  describe("Multiple Callbacks", () => {
    it("renders both retry and dismiss buttons when both callbacks are provided", () => {
      const onRetry = vi.fn();
      const onDismiss = vi.fn();
      render(<AIError onRetry={onRetry} onDismiss={onDismiss} />);

      expect(screen.getByTestId("ai-error-retry-button")).toBeInTheDocument();
      expect(screen.getByTestId("ai-error-dismiss-button")).toBeInTheDocument();
    });

    it("both callbacks work independently", () => {
      const onRetry = vi.fn();
      const onDismiss = vi.fn();
      render(<AIError onRetry={onRetry} onDismiss={onDismiss} />);

      fireEvent.click(screen.getByTestId("ai-error-retry-button"));
      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onDismiss).not.toHaveBeenCalled();

      fireEvent.click(screen.getByTestId("ai-error-dismiss-button"));
      expect(onDismiss).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA role", () => {
      render(<AIError />);

      expect(screen.getByTestId("ai-error")).toHaveAttribute("role", "alert");
    });

    it("has proper aria-live attribute", () => {
      render(<AIError />);

      expect(screen.getByTestId("ai-error")).toHaveAttribute(
        "aria-live",
        "polite"
      );
    });

    it("compact mode has proper ARIA attributes", () => {
      render(<AIError compact />);

      expect(screen.getByTestId("ai-error-compact")).toHaveAttribute(
        "role",
        "alert"
      );
      expect(screen.getByTestId("ai-error-compact")).toHaveAttribute(
        "aria-live",
        "polite"
      );
    });

    it("retry button has proper aria-label", () => {
      const onRetry = vi.fn();
      render(<AIError onRetry={onRetry} />);

      expect(screen.getByTestId("ai-error-retry-button")).toHaveAttribute(
        "aria-label",
        "Try again"
      );
    });

    it("dismiss button has proper aria-label", () => {
      const onDismiss = vi.fn();
      render(<AIError onDismiss={onDismiss} />);

      expect(screen.getByTestId("ai-error-dismiss-button")).toHaveAttribute(
        "aria-label",
        "Dismiss error"
      );
    });

    it("compact retry button has proper aria-label", () => {
      const onRetry = vi.fn();
      render(<AIError onRetry={onRetry} compact />);

      expect(screen.getByTestId("ai-error-retry-button")).toHaveAttribute(
        "aria-label",
        "Retry request"
      );
    });
  });

  describe("Edge Cases", () => {
    it("handles empty string error message", () => {
      render(<AIError error="" />);

      expect(screen.getByTestId("ai-error-message")).toHaveTextContent(
        "AI could not process your request"
      );
    });

    it("handles undefined error with unknown type", () => {
      // @ts-ignore - Testing runtime behavior
      render(<AIError type="unknown" />);

      expect(screen.getByTestId("ai-error-message")).toHaveTextContent(
        "AI could not process your request"
      );
      expect(screen.getByTestId("ai-error-icon-general")).toBeInTheDocument();
    });

    it("handles multiple rapid clicks on retry button", () => {
      const onRetry = vi.fn();
      render(<AIError onRetry={onRetry} />);

      const retryButton = screen.getByTestId("ai-error-retry-button");
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(3);
    });

    it("handles multiple rapid clicks on dismiss button", () => {
      const onDismiss = vi.fn();
      render(<AIError onDismiss={onDismiss} />);

      const dismissButton = screen.getByTestId("ai-error-dismiss-button");
      fireEvent.click(dismissButton);
      fireEvent.click(dismissButton);
      fireEvent.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(3);
    });
  });

  describe("CSS Classes", () => {
    it("applies correct classes for regular mode", () => {
      render(<AIError />);

      const errorElement = screen.getByTestId("ai-error");
      expect(errorElement).toHaveClass(
        "bg-red-50",
        "border",
        "border-red-200",
        "rounded-lg",
        "p-4",
        "my-2",
        "max-w-md"
      );
    });

    it("applies correct classes for compact mode", () => {
      render(<AIError compact />);

      const errorElement = screen.getByTestId("ai-error-compact");
      expect(errorElement).toHaveClass(
        "inline-flex",
        "items-center",
        "gap-2",
        "bg-red-50",
        "border",
        "rounded-xl",
        "border-red-200",
        "px-3",
        "py-1.5",
        "text-sm"
      );
    });

    it("retry button has correct classes", () => {
      const onRetry = vi.fn();
      render(<AIError onRetry={onRetry} />);

      const retryButton = screen.getByTestId("ai-error-retry-button");
      expect(retryButton).toHaveClass(
        "flex",
        "items-center",
        "gap-2",
        "bg-red-600",
        "text-white",
        "px-3",
        "py-1.5",
        "rounded",
        "text-sm",
        "font-medium"
      );
    });
  });

  describe("Custom TestId Propagation", () => {
    it("propagates custom testId to all child elements", () => {
      const customTestId = "custom-error-component";
      const onRetry = vi.fn();
      const onDismiss = vi.fn();

      render(
        <AIError
          testId={customTestId}
          onRetry={onRetry}
          onDismiss={onDismiss}
        />
      );

      expect(screen.getByTestId(customTestId)).toBeInTheDocument();
      expect(screen.getByTestId(`${customTestId}-message`)).toBeInTheDocument();
      expect(screen.getByTestId(`${customTestId}-title`)).toBeInTheDocument();
      expect(
        screen.getByTestId(`${customTestId}-retry-button`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`${customTestId}-dismiss-button`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`${customTestId}-icon-general`)
      ).toBeInTheDocument();
    });

    it("propagates custom testId in compact mode", () => {
      const customTestId = "compact-custom-error";
      const onRetry = vi.fn();

      render(<AIError testId={customTestId} onRetry={onRetry} compact />);

      expect(screen.getByTestId(`${customTestId}-compact`)).toBeInTheDocument();
      expect(screen.getByTestId(`${customTestId}-message`)).toBeInTheDocument();
      expect(
        screen.getByTestId(`${customTestId}-retry-button`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`${customTestId}-icon-general`)
      ).toBeInTheDocument();
    });
  });
});
