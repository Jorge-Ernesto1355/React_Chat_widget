import { beforeEach, describe, expect, it } from "vitest";
import useMessages from "../useMessages";
import { act, renderHook } from "@testing-library/react";
import { INITIAL_MESSAGE_CONTENT } from "../../utils/createFirstMessage";
import { Role } from "../../types";

describe("useMessages", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it("should initialize with one initial message", () => {
    const { result } = renderHook(() => useMessages());
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe(Role.Assistant);
    expect(result.current.messages[0].content).toBe(INITIAL_MESSAGE_CONTENT);
  });

  it("should add user message", () => {
    const { result } = renderHook(() => useMessages());

    act(() => {
      result.current.addMessageUser("hello world");
    });
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].role).toBe(Role.User);
    expect(result.current.messages[1].content).toBe("hello world");
  });

  it("should not add an assintant message if the last message is the initial message", () => {
    const { result } = renderHook(() => useMessages());

    act(() => {
      result.current.addMessageAssistant("hello world");
    });
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe(Role.Assistant);
    expect(result.current.messages[0].content).toBe(INITIAL_MESSAGE_CONTENT);
  });

  it("should allow adding an assistant message after of the message user", () => {
    const { result } = renderHook(() => useMessages());

    act(() => {
      result.current.addMessageUser("hello world");
      result.current.addMessageAssistant("assistant response");
    });
    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[2].role).toBe(Role.Assistant);
    expect(result.current.messages[2].content).toBe("assistant response");
  });

  it("adding multiple assistant messages should concatenate their content", () => {
    const { result } = renderHook(() => useMessages());
    act(() => {
      result.current.addMessageUser("hello world");
      result.current.addMessageAssistant("assistant response 1");
      result.current.addMessageAssistant("assistant response 2");
    });

    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[2].role).toBe(Role.Assistant);
    expect(result.current.messages[2].content).toBe(
      "assistant response 1assistant response 2"
    );
  });

  it("attempting to add an empty user message should not change the messages", () => {
    const { result } = renderHook(() => useMessages());

    act(() => {
      result.current.addMessageUser("");
    });
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe(Role.Assistant);
    expect(result.current.messages[0].content).toBe(INITIAL_MESSAGE_CONTENT);
  });

  it("shuold add the error property to the assitant message", () => {
    const { result } = renderHook(() => useMessages());

    act(() => {
      result.current.addMessageUser("hello world");
      result.current.addMessageAssistant("error message", {
        error: "error message",
      });
    });
    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[1].role).toBe(Role.User);
    expect(result.current.messages[1].content).toBe("hello world");
    expect(result.current.messages[2].error).toBe("error message");
  });
});
