import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSafeStyles } from "../useSafeStyles";

vi.mock("../../context/Context", async (importOriginal) => {
  const actual: object = await importOriginal();
  return {
    ...actual,
    useChatContext: vi.fn(() => {
      return {
        headerClassName: "",
        headerStyles: {},
      };
    }),
  };
});

import { useChatContext } from "../../context/Context";

describe("useSafeStyles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Sanitizes valid style objects, preserving only allowed CSS properties and safe values", () => {
    (useChatContext as any).mockReturnValue({
      headerClassName: "",
      headerStyles: { color: "#ffffff" },
    });

    const { result } = renderHook(() => useSafeStyles());

    expect(result.current.safeHeaderStyles).toEqual({ color: "#ffffff" });
  });

  it("shold return anything when anything has been passed", () => {
    (useChatContext as any).mockReturnValue({
      headerClassName: "",
      headerStyles: {},
    });

    const { result } = renderHook(() => useSafeStyles());

    expect(result.current.safeHeaderStyles).toEqual({});
    expect(result.current.safeHeaderClassName).toEqual("");
  });

  it("Returns sanitized  header styles and class names from context when provided with safe values", () => {
    (useChatContext as any).mockReturnValue({
      headerClassName: "text-red-500",
      headerStyles: { color: "#ffffff" },
    });

    const { result } = renderHook(() => useSafeStyles());

    expect(result.current.safeHeaderStyles).toEqual({ color: "#ffffff" });
    expect(result.current.safeHeaderClassName).toEqual("text-red-500");
  });

  it("Removes or warns about disallowed or dangerous CSS properties", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    (useChatContext as any).mockReturnValue({
      headerClassName: "hello",
      headerStyles: {},
    });

    const { result } = renderHook(() => useSafeStyles());

    expect(result.current.safeHeaderStyles).toEqual({});
    expect(result.current.safeHeaderClassName).toEqual("");
    expect(warnSpy).toHaveBeenCalledWith(
      "Class is not recognized as Tailwind: hello"
    );
  });

  it("handles excessively long or malformed className strings by truncating them or returning an empty string", () => {
    const longValidClassName = Array(101).fill("text-gray-800").join(" ");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    (useChatContext as any).mockReturnValue({
      headerClassName: longValidClassName,
      headerStyles: {},
    });

    const { result } = renderHook(() => useSafeStyles());

    expect(result.current.safeHeaderStyles).toEqual({});
    expect(result.current.safeHeaderClassName).toHaveLength(1000);
    expect(warnSpy).toHaveBeenCalledWith(
      "className is too large: 1413 characters"
    );
  });

  it("should handle the className and styles when are passed by undefined", () => {
    (useChatContext as any).mockReturnValue({
      headerClassName: undefined,
      headerStyles: undefined,
    });

    const { result } = renderHook(() => useSafeStyles());

    expect(result.current.safeHeaderStyles).toEqual({});
    expect(result.current.safeHeaderClassName).toEqual("");
  });
  it("should handle the className and styles when are passed by null", () => {
    (useChatContext as any).mockReturnValue({
      headerClassName: null,
      headerStyles: null,
    });

    const { result } = renderHook(() => useSafeStyles());

    expect(result.current.safeHeaderStyles).toEqual({});
    expect(result.current.safeHeaderClassName).toEqual("");
  });

  it("should filters out the className that is not a tailwind class", () => {
    (useChatContext as any).mockReturnValue({
      headerClassName: "text-lg custom-class flex bg-blue-500 not-tailwind",
      headerStyles: {},
    });

    const { result } = renderHook(() => useSafeStyles());

    expect(result.current.safeHeaderStyles).toEqual({});
    expect(result.current.safeHeaderClassName).toEqual(
      "text-lg flex bg-blue-500"
    );
  });

  it("should filters out the styles that are not allowed", () => {
    (useChatContext as any).mockReturnValue({
      headerClassName: "text-lg custom-class flex bg-blue-500 not-tailwind",
      headerStyles: {
        backgroundColor: "red",
        marginTop: "10px",
      },
    });

    const { result } = renderHook(() => useSafeStyles());

    expect(result.current.safeHeaderStyles).toEqual({
      backgroundColor: "red",
    });
  });

  it("warns and skips  propertires in className that are not allowed containing dangerous patterns", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const headerClassNames: string =
      "javascript:alert('XSS') {} [] expression url()";
    (useChatContext as any).mockReturnValue({
      headerClassName: headerClassNames,
      headerStyles: {},
    });

    const { result } = renderHook(() => useSafeStyles());

    expect(result.current.safeHeaderStyles).toEqual({});
    expect(result.current.safeHeaderClassName).toEqual("");
    expect(warnSpy).toHaveBeenCalledWith(
      "Class is not recognized as Tailwind: alertXSS"
    );
    expect(warnSpy).toHaveBeenCalledWith(
      "Class is not recognized as Tailwind: expression"
    );
    expect(warnSpy).toHaveBeenCalledWith(
      "Class is not recognized as Tailwind: url"
    );
  });

  it("should warn and skip propertise in the styles that are not allowed containing dangerous patterns", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const headerStyles: Record<string, any> = {
      backgroundColor: "javascript:alert('XSS')",
      color: "expression(alert('XSS'))",
      fontSize: "url(javascript:alert('XSS'))",
    };
    (useChatContext as any).mockReturnValue({
      headerClassName: "",
      headerStyles,
    });

    const { result } = renderHook(() => useSafeStyles());

    expect(result.current.safeHeaderStyles).toEqual({});
    expect(warnSpy).toHaveBeenCalledWith(
      "Property Value CSS is dangerous backgroundColor: javascript:alert('XSS')"
    );
    expect(warnSpy).toHaveBeenCalledWith(
      "Property Value CSS is dangerous color: expression(alert('XSS'))"
    );
    expect(warnSpy).toHaveBeenCalledWith(
      "Property Value CSS is dangerous fontSize: url(javascript:alert('XSS'))"
    );
  });
});
