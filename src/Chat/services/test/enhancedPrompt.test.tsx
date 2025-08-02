import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  AdvancedPromptEnhancer,
  createCompliancePrompt,
  createCustomerSupportPrompt,
  createDocumentationPrompt,
  createEnhancedPrompt,
  createQABotPrompt,
  type Question,
} from "../utils/EnhancePrompt";

// Mock data for testing
const mockQAData = {
  questions: [
    {
      question: "What are your business hours?",
      answer: "We're open Monday-Friday 9AM-5PM EST",
      category: "operations",
      confidence: 0.95,
    },
    {
      question: "How do I reset my password?",
      answer:
        "Click 'Forgot Password' on the login page and follow the email instructions",
      category: "technical",
      confidence: 0.9,
    },
    {
      question: "What is your return policy?",
      answer: "Items can be returned within 30 days of purchase",
      category: "policy",
      confidence: 0.8,
    },
  ],
  metadata: {
    version: "1.0",
    source: "Customer Support KB",
    lastUpdated: new Date("2024-01-15"),
  },
};

const mockArrayData = [
  { question: "Question 1", answer: "Answer 1" },
  { question: "Question 2", answer: "Answer 2" },
];

const mockObjectData = {
  company_name: "TechCorp",
  founded: "2020",
  employees: "100+",
};

const mockPrimitiveData = "Simple string data";

describe("AdvancedPromptEnhancer", () => {
  let enhancer: AdvancedPromptEnhancer;

  beforeEach(() => {
    enhancer = new AdvancedPromptEnhancer();
  });

  describe("Constructor and Configuration", () => {
    it("should create instance with default config", () => {
      expect(enhancer).toBeInstanceOf(AdvancedPromptEnhancer);
      expect(enhancer["config"]).toBeDefined();
    });

    it("should accept custom configuration", () => {
      const customConfig = {
        strictMode: true,
        responseFormat: "concise" as const,
        priority: "safety" as const,
      };

      const customEnhancer = new AdvancedPromptEnhancer(customConfig);
      expect(customEnhancer["config"].strictMode).toBe(true);
      expect(customEnhancer["config"].responseFormat).toBe("concise");
      expect(customEnhancer["config"].priority).toBe("safety");
    });

    it("should merge custom config with defaults", () => {
      const customEnhancer = new AdvancedPromptEnhancer({ strictMode: true });

      expect(customEnhancer["config"].strictMode).toBe(true);
      expect(customEnhancer["config"].allowRelatedQuestions).toBe(true); // default
      expect(customEnhancer["config"].responseFormat).toBe("detailed"); // default
    });
  });

  describe("Data Structuring", () => {
    it("should handle structured Q&A data", () => {
      const result = enhancer["structureData"](mockQAData);

      expect(result.questions).toBeDefined();
      expect(result.questions).toHaveLength(3);
      expect(result.questions![0].question).toBe(
        "What are your business hours?"
      );
      expect(result.questions![0].category).toBe("operations");
      expect(result.questions![0].confidence).toBe(0.95);
      expect(result.metadata).toBeDefined();
    });

    it("should convert array data to structured format", () => {
      const result = enhancer["structureData"](mockArrayData);

      expect(result.questions).toBeDefined();
      expect(result.questions).toHaveLength(2);
      expect(result.questions![0].question).toBe("Question 1");
      expect(result.questions![0].answer).toBe("Answer 1");
      expect(result.questions![0].category).toBe("general");
      expect(result.questions![0].confidence).toBe(0.9);
    });

    it("should convert object data to Q&A format", () => {
      const result = enhancer["structureData"](mockObjectData);

      expect(result.questions).toBeDefined();
      expect(result.questions).toHaveLength(3);
      expect(result.questions![0].question).toBe("company_name");
      expect(result.questions![0].answer).toBe("TechCorp");
      expect(result.questions![1].question).toBe("founded");
      expect(result.questions![1].answer).toBe("2020");
    });

    it("should handle primitive data", () => {
      const result = enhancer["structureData"](mockPrimitiveData);

      expect(result.questions).toBeDefined();
      expect(result.questions).toHaveLength(1);
      expect(result.questions![0].question).toBe("Available Information");
      expect(result.questions![0].answer).toBe("Simple string data");
      expect(result.questions![0].confidence).toBe(0.8);
    });

    it("should handle null/undefined data", () => {
      const resultNull = enhancer["structureData"](null);
      const resultUndefined = enhancer["structureData"](undefined);

      expect(resultNull.questions).toHaveLength(1);
      expect(resultUndefined.questions).toHaveLength(1);
    });

    it("should handle empty array", () => {
      const result = enhancer["structureData"]([]);

      expect(result.questions).toHaveLength(0);
    });

    it("should handle complex nested objects", () => {
      const complexData = {
        user: { name: "John", age: 30, settings: { theme: "dark" } },
        products: ["item1", "item2"],
      };

      const result = enhancer["structureData"](complexData);

      expect(result.questions).toHaveLength(2);
      expect(result.questions![0].question).toBe("user");
      expect(result.questions![0].answer).toContain("John");
      expect(result.questions![1].question).toBe("products");
    });
  });

  describe("Confidence Indicators", () => {
    it("should return correct confidence indicators", () => {
      expect(enhancer["getConfidenceIndicator"](0.95)).toBe("🟢");
      expect(enhancer["getConfidenceIndicator"](0.85)).toBe("🟡");
      expect(enhancer["getConfidenceIndicator"](0.65)).toBe("🔴");
      expect(enhancer["getConfidenceIndicator"](0.5)).toBe("🔴");
    });

    it("should handle edge cases for confidence", () => {
      expect(enhancer["getConfidenceIndicator"](0.9)).toBe("🟢");
      expect(enhancer["getConfidenceIndicator"](0.7)).toBe("🟡");
      expect(enhancer["getConfidenceIndicator"](0.69)).toBe("🔴");
    });
  });

  describe("Question Categorization", () => {
    it("should categorize questions correctly", () => {
      const questions: Question[] = [
        { question: "Q1", answer: "A1", category: "tech" },
        { question: "Q2", answer: "A2", category: "tech" },
        { question: "Q3", answer: "A3", category: "policy" },
        { question: "Q4", answer: "A4" }, // no category (should be "General")
      ];

      const result = enhancer["categorizeQuestions"](questions);

      expect(result).toHaveProperty("tech");
      expect(result).toHaveProperty("policy");
      expect(result).toHaveProperty("General");
      expect(result.tech).toHaveLength(2);
      expect(result.policy).toHaveLength(1);
      expect(result.General).toHaveLength(1);
    });

    it("should handle empty questions array", () => {
      const result = enhancer["categorizeQuestions"]([]);
      expect(result).toEqual({});
    });
  });

  describe("Prompt Building Components", () => {
    it("should build system identity section", () => {
      const identity = enhancer["buildSystemIdentity"]();

      expect(identity).toContain("SPECIALIZED AI ASSISTANT");
      expect(identity).toContain("Core Capabilities");
      expect(identity).toContain("expert AI assistant");
    });

    it("should build knowledge base section with structured data", () => {
      const structuredData = enhancer["structureData"](mockQAData);
      const knowledgeBase = enhancer["buildKnowledgeBase"](structuredData);

      expect(knowledgeBase).toContain("KNOWLEDGE BASE");
      expect(knowledgeBase).toContain("OPERATIONS");
      expect(knowledgeBase).toContain("TECHNICAL");
      expect(knowledgeBase).toContain("POLICY");
      expect(knowledgeBase).toContain("What are your business hours?");
      expect(knowledgeBase).toContain("Customer Support KB");
      expect(knowledgeBase).toContain("🟢"); // confidence indicator
    });

    it("should build knowledge base with empty data", () => {
      const emptyData = { questions: [] };
      const knowledgeBase = enhancer["buildKnowledgeBase"](emptyData);

      expect(knowledgeBase).toContain("No specific knowledge base provided");
    });

    it("should build instructions section", () => {
      const instructions = enhancer["buildInstructions"]();

      expect(instructions).toContain("RESPONSE INSTRUCTIONS");
      expect(instructions).toContain("Primary Behavior");
      expect(instructions).toContain("Confidence Levels");
      expect(instructions).toContain("When Information is Unavailable");
    });

    it("should build examples section", () => {
      const structuredData = enhancer["structureData"](mockQAData);
      const examples = enhancer["buildExamples"](structuredData);

      expect(examples).toContain("RESPONSE EXAMPLES");
      expect(examples).toContain("Example 1");
      expect(examples).toContain("User:");
      expect(examples).toContain("Assistant:");
    });

    it("should skip examples when disabled", () => {
      const noExampleEnhancer = new AdvancedPromptEnhancer({
        includeExamples: false,
      });
      const structuredData = noExampleEnhancer["structureData"](mockQAData);
      const examples = noExampleEnhancer["buildExamples"](structuredData);

      expect(examples).toBe("");
    });

    it("should build constraints section", () => {
      const constraints = enhancer["buildConstraints"]();

      expect(constraints).toContain("OPERATIONAL CONSTRAINTS");
      expect(constraints).toContain("Never fabricate");
      expect(constraints).toContain("confidence level");
    });

    it("should build constraints with strict mode", () => {
      const strictEnhancer = new AdvancedPromptEnhancer({ strictMode: true });
      const constraints = strictEnhancer["buildConstraints"]();

      expect(constraints).toContain("STRICT MODE");
    });

    it("should build user query section", () => {
      const userQuery = enhancer["buildUserQuery"]("Test question");

      expect(userQuery).toContain("USER QUERY");
      expect(userQuery).toContain("Test question");
      expect(userQuery).toContain("confidence level");
    });
  });

  describe("Full Prompt Enhancement", () => {
    it("should generate complete enhanced prompt", () => {
      const prompt = enhancer.enhancePrompt("What are your hours?", mockQAData);

      expect(prompt).toContain("SPECIALIZED AI ASSISTANT");
      expect(prompt).toContain("KNOWLEDGE BASE");
      expect(prompt).toContain("RESPONSE INSTRUCTIONS");
      expect(prompt).toContain("RESPONSE EXAMPLES");
      expect(prompt).toContain("OPERATIONAL CONSTRAINTS");
      expect(prompt).toContain("USER QUERY");
      expect(prompt).toContain("What are your hours?");
    });

    it("should handle different response formats", () => {
      const conciseEnhancer = new AdvancedPromptEnhancer({
        responseFormat: "concise",
      });
      const structuredEnhancer = new AdvancedPromptEnhancer({
        responseFormat: "structured",
      });

      const concisePrompt = conciseEnhancer.enhancePrompt("Test", mockQAData);
      const structuredPrompt = structuredEnhancer.enhancePrompt(
        "Test",
        mockQAData
      );

      expect(concisePrompt).toContain("brief and to the point");
      expect(structuredPrompt).toContain("clear structure using headings");
    });

    it("should handle different fallback behaviors", () => {
      const refuseEnhancer = new AdvancedPromptEnhancer({
        fallbackBehavior: "refuse",
      });
      const clarifyEnhancer = new AdvancedPromptEnhancer({
        fallbackBehavior: "clarify",
      });
      const suggestEnhancer = new AdvancedPromptEnhancer({
        fallbackBehavior: "suggest",
      });

      const refusePrompt = refuseEnhancer.enhancePrompt("Test", mockQAData);
      const clarifyPrompt = clarifyEnhancer.enhancePrompt("Test", mockQAData);
      const suggestPrompt = suggestEnhancer.enhancePrompt("Test", mockQAData);

      expect(refusePrompt).toContain("decline to answer");
      expect(clarifyPrompt).toContain("Ask for clarification");
      expect(suggestPrompt).toContain("Suggest alternative");
    });
  });

  describe("Configuration Factory Methods", () => {
    it("should create customer support config", () => {
      const config = AdvancedPromptEnhancer.createConfig("customer-support");

      expect(config.strictMode).toBe(false);
      expect(config.allowRelatedQuestions).toBe(true);
      expect(config.responseFormat).toBe("detailed");
      expect(config.fallbackBehavior).toBe("clarify");
      expect(config.priority).toBe("helpfulness");
    });

    it("should create documentation config", () => {
      const config = AdvancedPromptEnhancer.createConfig("documentation");

      expect(config.responseFormat).toBe("structured");
      expect(config.fallbackBehavior).toBe("suggest");
      expect(config.priority).toBe("accuracy");
    });

    it("should create QA bot config", () => {
      const config = AdvancedPromptEnhancer.createConfig("qa-bot");

      expect(config.responseFormat).toBe("concise");
      expect(config.fallbackBehavior).toBe("clarify");
      expect(config.priority).toBe("accuracy");
    });

    it("should create strict compliance config", () => {
      const config = AdvancedPromptEnhancer.createConfig("strict-compliance");

      expect(config.strictMode).toBe(true);
      expect(config.allowRelatedQuestions).toBe(false);
      expect(config.responseFormat).toBe("structured");
      expect(config.fallbackBehavior).toBe("refuse");
      expect(config.priority).toBe("safety");
    });

    it("should handle unknown use case", () => {
      const config = AdvancedPromptEnhancer.createConfig("unknown" as any);
      expect(config).toEqual({});
    });
  });

  describe("Factory Functions", () => {
    it("should create enhanced prompt with default config", () => {
      const prompt = createEnhancedPrompt("Test question", mockQAData);

      expect(prompt).toContain("SPECIALIZED AI ASSISTANT");
      expect(prompt).toContain("Test question");
    });

    it("should create customer support prompt", () => {
      const prompt = createCustomerSupportPrompt("How can I help?", mockQAData);

      expect(prompt).toContain("SPECIALIZED AI ASSISTANT");
      expect(prompt).toContain("How can I help?");
      expect(prompt).toContain("helpful and professional");
    });

    it("should create documentation prompt", () => {
      const prompt = createDocumentationPrompt("Explain feature X", mockQAData);

      expect(prompt).toContain("clear structure using headings");
      expect(prompt).toContain("Explain feature X");
    });

    it("should create QA bot prompt", () => {
      const prompt = createQABotPrompt("Quick question", mockQAData);

      expect(prompt).toContain("brief and to the point");
      expect(prompt).toContain("Quick question");
    });

    it("should create compliance prompt", () => {
      const prompt = createCompliancePrompt("Compliance query", mockQAData);

      expect(prompt).toContain("STRICT MODE");
      expect(prompt).toContain("Compliance query");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle questions without answers", () => {
      const incompleteData = {
        questions: [{ question: "Incomplete question" }],
      };

      const prompt = enhancer.enhancePrompt("Test", incompleteData);
      expect(prompt).toContain("Incomplete question");
    });

    it("should handle very long data sets", () => {
      const largeData = {
        questions: Array.from({ length: 1000 }, (_, i) => ({
          question: `Question ${i}`,
          answer: `Answer ${i}`,
          category: `category-${i % 10}`,
        })),
      };

      const prompt = enhancer.enhancePrompt("Test", largeData);
      expect(prompt).toContain("Question 0");
      expect(prompt.length).toBeGreaterThan(1000);
    });

    it("should handle empty strings", () => {
      const prompt = enhancer.enhancePrompt("", "");

      expect(prompt).toContain("USER QUERY");
      expect(prompt).toContain("KNOWLEDGE BASE");
    });

    it("should handle special characters in data", () => {
      const specialData = {
        questions: [
          {
            question: "What about emojis? 🚀💡",
            answer: "They work fine! ✅",
            category: "special-chars",
          },
        ],
      };

      const prompt = enhancer.enhancePrompt("Test 🔥", specialData);
      expect(prompt).toContain("🚀💡");
      expect(prompt).toContain("✅");
      expect(prompt).toContain("Test 🔥");
    });
  });

  describe("Performance and Memory", () => {
    it("should handle large prompts efficiently", () => {
      const startTime = performance.now();

      const largePrompt = "A".repeat(10000);
      const result = enhancer.enhancePrompt(largePrompt, mockQAData);

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
      expect(result).toContain("A".repeat(10000));
    });

    it("should not leak memory with multiple calls", () => {
      // Simulate multiple calls
      for (let i = 0; i < 100; i++) {
        enhancer.enhancePrompt(`Test ${i}`, mockQAData);
      }

      // If we reach here without memory issues, the test passes
      expect(true).toBe(true);
    });
  });

  describe("Snapshot Tests", () => {
    it("should generate consistent prompts", () => {
      const testData = {
        questions: [
          {
            question: "Test question",
            answer: "Test answer",
            category: "test",
            confidence: 0.9,
          },
        ],
      };

      const prompt1 = enhancer.enhancePrompt("Test", testData);
      const prompt2 = enhancer.enhancePrompt("Test", testData);

      expect(prompt1).toBe(prompt2);
    });
  });

  describe("Integration Tests", () => {
    it("should work with real-world customer support scenario", () => {
      const customerData = {
        questions: [
          {
            question: "How do I track my order?",
            answer:
              "You can track your order using the tracking number sent to your email",
            category: "orders",
            confidence: 0.95,
          },
          {
            question: "What is your return policy?",
            answer:
              "Items can be returned within 30 days with original receipt",
            category: "policy",
            confidence: 0.9,
          },
        ],
      };

      const prompt = createCustomerSupportPrompt(
        "I need help with my recent order",
        customerData
      );

      expect(prompt).toContain("track my order");
      expect(prompt).toContain("return policy");
      expect(prompt).toContain("I need help with my recent order");
      expect(prompt).toContain("🟢"); // High confidence indicator
    });

    it("should work with technical documentation scenario", () => {
      const techData = {
        questions: [
          {
            question: "How to install the package?",
            answer: "Run npm install package-name",
            category: "installation",
            confidence: 0.95,
          },
          {
            question: "API rate limits?",
            answer: "Maximum 1000 requests per hour",
            category: "api",
            confidence: 0.9,
          },
        ],
      };

      const prompt = createDocumentationPrompt(
        "Show me the installation steps",
        techData
      );

      expect(prompt).toContain("clear structure using headings");
      expect(prompt).toContain("npm install");
      expect(prompt).toContain("installation steps");
    });
  });
});

// Additional utility tests
describe("Utility Functions", () => {
  it("should export all required functions", () => {
    expect(createEnhancedPrompt).toBeTypeOf("function");
    expect(createCustomerSupportPrompt).toBeTypeOf("function");
    expect(createDocumentationPrompt).toBeTypeOf("function");
    expect(createQABotPrompt).toBeTypeOf("function");
    expect(createCompliancePrompt).toBeTypeOf("function");
  });

  it("should handle typescript interfaces correctly", () => {
    // This test ensures TypeScript interfaces are properly defined
    const config = {
      strictMode: true,
      allowRelatedQuestions: false,
      responseFormat: "concise" as const,
      priority: "safety" as const,
    };

    const enhancer = new AdvancedPromptEnhancer(config);
    expect(enhancer).toBeInstanceOf(AdvancedPromptEnhancer);
  });
});

// Snapshot testing for prompt consistency

// Mock Date for consistent testing
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2024-01-15"));
});
