import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useAIService from "../useAIService";
import { act } from "react";
import { serviceManager } from "../../services/Service";
import type { Message } from "../../types";
import { mockData } from "../../test/mocks/mocks";

vi.mock("../../services/Service", () => {
  const mockService = {
    enhancePrompt: vi.fn(async (prompt) => [`ENHANCED: ${prompt}`]),
    run: vi.fn(async (onChunk) => {
      onChunk("respuesta generada");
    }),
  };
  return {
    serviceManager: {
      create: vi.fn(() => mockService),
    },
  };
});

describe("useAIService", () => {
  const apiKey = "test";
  const serviceName = "huggingface";
  const data = mockData;
  const onChunk = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a service and run enhancedPropmt and run methods", async () => {
    const { result } = renderHook(() =>
      useAIService({ serviceName, apiKey, data, onChunk })
    );

    const messages: Message[] = [
      { role: "user", content: "hello", id: "e", error: null },
    ];

    await act(async () => {
      result.current("test prompt", messages);
    });
    const { serviceManager } = await import("../../services/Service");
    const instance = serviceManager.create(serviceName, apiKey);
    expect(serviceManager.create).toHaveBeenCalledWith(serviceName, apiKey);
    expect(instance.enhancePrompt).toHaveBeenCalledWith(
      "test prompt",
      data,
      messages
    );
    expect(instance.run).toHaveBeenCalledWith({
      onChunk,
      prompt: ["ENHANCED: test prompt"],
    });
  });

  it("should re-use the same isntance of the service", async () => {
    const { result } = renderHook(() =>
      useAIService({ serviceName, apiKey, data, onChunk })
    );
    await act(async () => {
      result.current("test prmpt");
      result.current("test prmpt 2");
    });

    expect(serviceManager.create).toHaveBeenCalledTimes(1);
  });

  it("shoudl throw an error if the service fails", async () => {
    const { result } = renderHook(() =>
      useAIService({ serviceName, apiKey, data, onChunk })
    );

    const errorMessage = "Something went wrong";
    const mockService = serviceManager.create(serviceName, apiKey);
    (mockService.enhancePrompt as any).mockRejectedValue(
      new Error(errorMessage)
    );

    await expect(async () => {
      await act(async () => {
        await result.current("test prmpt");
      });
    }).rejects.toThrowError(errorMessage);
  });

  it("should throw an error if the run method fails", async () => {
    const { result } = renderHook(() =>
      useAIService({ serviceName, apiKey, data, onChunk })
    );

    const errorMessage = "Something went wrong";
    const mockService = serviceManager.create(serviceName, apiKey);
    (mockService.run as any).mockRejectedValue(new Error(errorMessage));
    await expect(async () => {
      await act(async () => {
        await result.current("test prmpt");
      });
    }).rejects.toThrowError(errorMessage);
  });

  it("should not call the run method if the enhancePrompt fails or returns null or undefined", async () => {
    const { result } = renderHook(() =>
      useAIService({ serviceName, apiKey, data, onChunk })
    );

    const mockService = serviceManager.create(serviceName, apiKey);
    (mockService.enhancePrompt as any).mockResolvedValue(undefined);
    await act(async () => {
      result.current("test propt");
    });
    expect(mockService.run).not.toHaveBeenCalled();
    (mockService.enhancePrompt as any).mockResolvedValue(null);
    await act(async () => {
      result.current("test propt");
    });
    expect(mockService.run).not.toHaveBeenCalled();

    (mockService.enhancePrompt as any).mockRejectedValue(new Error("error"));
    await act(async () => {
      result.current("test propt");
    });
    expect(mockService.run).not.toHaveBeenCalled();
  });
});
