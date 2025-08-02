import type { DataProps } from "../../services/utils/EnhancePrompt";

export const mockData: DataProps = {
  questions: [
    {
      question: "what are the hours of close or open in the InsightFlow",
      answer:
        "the hours of close or open in the InsightFlow are Monday to Friday from 10am to 4pm",
      category: "general",
      confidence: 0.9,
    },
  ],
  useCase: "customer-support",
};
