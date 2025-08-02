import { HuggingFaceService } from "../services/huggingFace/HuggingFaceService";
import { ReplicateService } from "../services/replicateService/ReplicateServices";
import type { AIservice } from "../services/Service";

export const isValidService = (service: AIservice | null): boolean => {
  if (service === null) return false;
  return (
    (service !== null && service instanceof HuggingFaceService) ||
    service instanceof ReplicateService
  );
};
