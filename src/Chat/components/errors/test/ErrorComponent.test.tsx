import { describe, expect, it, vi } from "vitest";
import ErrorComponent from "../ErrorComponent";
import { render, screen } from "@testing-library/react";

describe("ErrorComponent", () => {
  it("should render correctly with the default props", () => {
    render(<ErrorComponent />);

    const alert = screen.getByRole("alert");
    const warningIcon = screen.getByLabelText("warning icon");
    const message = screen.getByLabelText("error message");
    const details = screen.getByLabelText("error details");

    expect(alert).toBeInTheDocument();
    expect(warningIcon).toBeInTheDocument();
    expect(message).toBeInTheDocument();
    expect(details).toBeInTheDocument();
  });

  it("should render with the custom message and details and  retry button", () => {
    const messageProp = "Error: No keys found";
    const detailsProp = "Please check your configuration and try again.";
    const onRetry = vi.fn();

    render(
      <ErrorComponent
        message={messageProp}
        details={detailsProp}
        onRetry={onRetry}
      />
    );

    const message = screen.getByLabelText("error message");
    const details = screen.getByLabelText("error details");
    const retryButton = screen.getByText("Try Again");

    expect(message).toHaveTextContent(messageProp);
    expect(details).toHaveTextContent(detailsProp);
    expect(retryButton).toBeInTheDocument();
  });

  it("should be able to run the onRetry function", () => {
    const onRetry = vi.fn();
    render(<ErrorComponent onRetry={onRetry} />);
    const retryButton = screen.getByText("Try Again");
    expect(retryButton).toBeInTheDocument();
    retryButton.click();
    expect(onRetry).toHaveBeenCalled();
  });

  it("should apply custom className", () => {
    const customClass = "custom-class";
    render(<ErrorComponent className={customClass} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass(customClass);
  });
});
