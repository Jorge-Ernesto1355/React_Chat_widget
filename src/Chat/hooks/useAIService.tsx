import { useCallback, useRef } from "react";
import {
  serviceManager,
  type AIservice,
  type ServiceName,
} from "../services/Service";
import type { Message } from "../types";
import type { ConfigType } from "../context/Context";

interface useAIServiceProps {
  serviceName: ServiceName;
  apiKey: string;
  data: any;
  onChunk: (chunk: string) => void;
  config?: ConfigType | undefined;
}

const useAIService = ({
  config,
  serviceName,
  apiKey,
  data,
  onChunk,
}: useAIServiceProps) => {
  const service = useRef<AIservice | null>(null);

  const runAI = useCallback(async (prompt: string, messages?: Message[]) => {
    try {
      if (!service.current) {
        service.current = serviceManager.create(serviceName, apiKey, config);
      }

      const enhancedPrompt = await service.current.enhancePrompt(
        prompt,
        data,
        messages
      );
      enhancedPrompt &&
        (await service.current.run({ onChunk, prompt: enhancedPrompt }));
    } catch (error) {
      throw error;
    }
  }, []);

  return runAI;
};

export default useAIService;
