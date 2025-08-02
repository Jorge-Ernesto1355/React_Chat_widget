import { describe, expect, it } from "vitest";
import ContextChat from "../../context/Context";
import Header from "../Header";
import { fireEvent, render, screen } from "@testing-library/react";
import { mockData } from "../../test/mocks/mocks";

const renderWithContext = ({
  huggingface,
  replicate,
  title,
  headerStyles,
  headerClassName,
}: {
  huggingface?: string;
  replicate?: string;
  title?: string;
  headerStyles?: React.CSSProperties;
  headerClassName?: string;
} = {}) => {
  return render(
    <ContextChat
      title={title}
      huggingface={huggingface}
      replicate={replicate}
      data={mockData}
      headerStyles={headerStyles}
      headerClassName={headerClassName}
    >
      <Header />
    </ContextChat>
  );
};

describe("Header", () => {
  it("should render the header component", () => {
    renderWithContext();

    const header = screen.getByRole("banner");
    const titleContainer = screen.getByLabelText("Chat assistant title");
    const buttonClose = screen.getByLabelText("Close chat");

    expect(header).toBeInTheDocument();
    expect(titleContainer).toBeInTheDocument();
    expect(buttonClose).toBeInTheDocument();
  });

  it("should render the title prop correctly when passes", () => {
    renderWithContext({ title: "My title" });
    const title = screen.getByLabelText("header-title");
    expect(title).toHaveTextContent("My title");
  });

  it("should render 'AI Assistant' when the title prop is not passes", () => {
    renderWithContext();
    const title = screen.getByLabelText("header-title");
    expect(title).toHaveTextContent("AI Assistant");
  });

  it("should not render the powered by label when validatekeys returns false", () => {
    renderWithContext();
    const poweredBy = screen.queryByLabelText("Powered by information");
    const textServiceName = screen.queryByLabelText("service name");
    expect(textServiceName).not.toBeInTheDocument();
    expect(poweredBy).not.toBeInTheDocument();
  });

  it("should render the 'powered by' label with the correct name  provider when validatekeys returns success", () => {
    renderWithContext({ huggingface: "huggingface" });
    const poweredBy = screen.queryByLabelText("Powered by information");
    const textServiceName = screen.queryByLabelText("service name");
    expect(poweredBy).toBeInTheDocument();
    expect(textServiceName).toHaveTextContent("Huggingface");
  });

  it("should not pass anything if we not pass the onClose prop", async () => {
    renderWithContext();
    const buttonClose = screen.getByLabelText("Close chat");
    fireEvent.click(buttonClose);
  });

  it("should not render the poweredBy laben when more than one serivce is passed", async () => {
    renderWithContext({ huggingface: "huggingface", replicate: "replicate" });
    const poweredBy = screen.queryByLabelText("Powered by information");
    expect(poweredBy).not.toBeInTheDocument();
  });

  it("should have the right className when any of the styles are not passed", () => {
    renderWithContext();
    const header = screen.getByRole("banner");
    expect(header).toHaveClass(
      "border-b p-2 row-span-1 flex justify-start items-center"
    );
  });

  it("should override the headerStyles when are passed", () => {
    renderWithContext({ headerStyles: { color: "#ffffff" } });
    const header = screen.getByRole("banner");
    expect(header).toHaveStyle("color: #ffffff");
  });

  it("should render the headerClassName when are passed", () => {
    renderWithContext({ headerClassName: "text-red-500" });
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("text-red-500");
  });

  it("should have the right classname when headerClassname is passed  and headerStyles is passed too", () => {
    renderWithContext({
      headerClassName: "text-red-500",
      headerStyles: { color: "#ffffff" },
    });
    const header = screen.getByRole("banner");
    expect(header).toHaveClass(
      "text-red-500 border-b p-2 row-span-1 flex justify-start items-center"
    );
    expect(header).toHaveStyle("color: #ffffff");
  });
});
