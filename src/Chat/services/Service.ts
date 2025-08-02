import type { ConfigType } from "../context/Context";
import type { Message } from "../types";
import { isHuggingFaceConfig } from "./huggingFace/huggingFaceBuilder";
import { HuggingFaceServiceFactory } from "./huggingFace/HuggingFaceService";
import {
  isReplicateConfig,
  ReplicateServiceFactory,
} from "./replicateService/replicateServiceBuilder";
export interface RunProps<TPrompt = any> {
  prompt: TPrompt;
  onChunk: (chunk: string) => void;
}

export interface AIservice<TPrompt = any> {
  run(props: RunProps<TPrompt>): Promise<void>;
  enhancePrompt(
    prompt: string,
    data: any,
    messages?: Message[]
  ): Promise<TPrompt>;
}

export type ServiceName = "huggingface" | "replicate";

export class ServiceManager {
  private static instance: ServiceManager;
  private services = new Map<
    ServiceName,
    (key: string, config?: ConfigType) => AIservice
  >();

  private constructor() {}

  public static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  public register<T extends AIservice>(
    name: ServiceName,
    serviceClass: (key: string, config?: ConfigType) => T
  ) {
    if (this.services.has(name)) {
      throw new Error(`Service ${name} is already registered`);
    }
    this.services.set(name, serviceClass);
  }

  public create(
    serviceName: ServiceName,
    apiKey: string,
    config?: ConfigType
  ): AIservice {
    const ServiceClass = this.services.get(serviceName);
    if (!ServiceClass) {
      throw new Error(`Service ${serviceName} not registered`);
    }
    return ServiceClass(apiKey, config);
  }
}

export const ERROR_CONFIG_VALIDATION =
  "Invalid config try again or use default config";
export const serviceManager = ServiceManager.getInstance();
serviceManager.register(
  "huggingface",
  (apiKey: string, config?: ConfigType) => {
    if (config) {
      if (isHuggingFaceConfig(config)) {
        return HuggingFaceServiceFactory.create(apiKey, config);
      } else throw new Error(ERROR_CONFIG_VALIDATION);
    }

    return HuggingFaceServiceFactory.create(apiKey);
  }
);
serviceManager.register("replicate", (apiKey: string, config?: ConfigType) => {
  if (config) {
    if (isReplicateConfig(config)) {
      return ReplicateServiceFactory.create(apiKey, config);
    }
    throw new Error(ERROR_CONFIG_VALIDATION);
  }
  return ReplicateServiceFactory.create(apiKey);
});
// Register services
