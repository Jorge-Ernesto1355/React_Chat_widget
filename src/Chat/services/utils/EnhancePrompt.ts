export interface PromptConfig {
  strictMode?: boolean;
  allowRelatedQuestions?: boolean;
  includeExamples?: boolean;
  responseFormat?: "concise" | "detailed" | "structured";
  confidenceThreshold?: "low" | "medium" | "high";
  fallbackBehavior?: "refuse" | "clarify" | "suggest";
  contextWindow?: number;
  priority?: "accuracy" | "helpfulness" | "safety";
}

export type useCase =
  | "customer-support"
  | "documentation"
  | "qa-bot"
  | "strict-compliance";

export interface Question {
  question: string;
  answer: string;
  category?: string;
  confidence?: number;
}

export interface DataProps {
  questions: Question[];
  useCase?: useCase;
  metadata?: {
    version: string;
    lastUpdated: Date;
    source: string;
  };
}

export interface DataStructure {
  questions?: Question[];
  categories?: Record<string, string>;
  metadata?: {
    version: string;
    lastUpdated: Date;
    source: string;
  };
}

export class AdvancedPromptEnhancer {
  private config: PromptConfig;

  constructor(config?: PromptConfig) {
    this.config = {
      strictMode: config?.strictMode ?? false,
      allowRelatedQuestions: config?.allowRelatedQuestions ?? true,
      includeExamples: config?.includeExamples ?? true,
      responseFormat: config?.responseFormat ?? "detailed",
      confidenceThreshold: config?.confidenceThreshold ?? "medium",
      fallbackBehavior: config?.fallbackBehavior ?? "clarify",
      contextWindow: config?.contextWindow ?? 4000,
      priority: config?.priority ?? "accuracy",
      ...config,
    };
  }

  enhancePrompt(userPrompt: string, data: any): string {
    const structureData = this.structureData(data);

    const systemIdentity = this.buildSystemIdentity();
    const knowledgeBase = this.buildKnowledgeBase(structureData);
    const instructions = this.buildInstructions();
    const examples = this.buildExamples(structureData);
    const constraints = this.buildConstraints();
    const userQuery = this.buildUserQuery(userPrompt);

    return [
      systemIdentity,
      knowledgeBase,
      instructions,
      examples,
      constraints,
      userQuery,
    ].join("\n\n");
  }

  private structureData(data: any): DataStructure {
    if (Array.isArray(data)) {
      return {
        questions: data.map((item, index) => ({
          question: item.question || `Item ${index + 1}`,
          answer: item.answer || JSON.stringify(item),
          category: item.category || "general",
          confidence: item.confidence || 0.9,
        })),
      };
    }

    if (typeof data === "object" && data !== null) {
      if (data.questions) return data as DataStructure;

      const questions = Object.entries(data).map(([key, value]) => ({
        question: key,
        answer: typeof value === "string" ? value : JSON.stringify(value),
        category: "General" as string,
        confidence: 0.9,
      }));

      return {
        questions,
      };
    }

    return {
      questions: [
        {
          question: "Available Information",
          answer: String(data),
          category: "General",
          confidence: 0.8,
        },
      ],
    };
  }

  private buildSystemIdentity(): string {
    return `# SPECIALIZED AI ASSISTANT

You are an AI assistant that must respond ONLY with the plain answer to the question.  

## STRICT OUTPUT RULES:
- Output must contain only the answer text.  
- Do not include "A:", "Answer:", "Response:", or any labels.  
- Do not include emojis, icons, bullets, or symbols.  
- Do not include categories, confidence, metadata, or explanations.  
- Do not include extra punctuation or trailing commentary.  
- End the response immediately after the last word of the answer.  

### CORRECT
Q: Who is the CEO of OpenAI?  
Sam Altman  

Q: What is 2 + 2?  
4  

### INCORRECT
A: Sam Altman 🟢  
Sam Altman : General knowledge base.  

`;
  }

  private buildKnowledgeBase(data: DataStructure): string {
    if (!data.questions || data.questions.length === 0) {
      return `## KNOWLEDGE BASE
        No specific knowledge base provided.`;
    }

    const categories = this.categorizeQuestions(data.questions);

    let knowledgeBase = `## KNOWLEDGE BASE\n\n`;

    // Add metadata if available
    if (data.metadata) {
      knowledgeBase += `**Source:** ${
        data.metadata.source || "Custom Dataset"
      }\n`;
      knowledgeBase += `**Last Updated:** ${
        data.metadata.lastUpdated || "Unknown"
      }\n`;
      knowledgeBase += `**Version:** ${data.metadata.version || "1.0"}\n\n`;
    }

    // Organize by categories
    for (const [category, questions] of Object.entries(categories)) {
      knowledgeBase += `### ${category.toUpperCase()}\n`;

      questions.forEach((q, index) => {
        const confidenceIndicator = this.getConfidenceIndicator(
          q.confidence || 0.9
        );
        knowledgeBase += `${index + 1}. **Q:** ${q.question}\n`;
        knowledgeBase += `   **A:** ${q.answer} ${confidenceIndicator}\n\n`;
      });
    }

    return knowledgeBase.trim();
  }

  private buildInstructions(): string {
    const instructions = [`## RESPONSE INSTRUCTIONS`];

    // Core behavior
    instructions.push(`### Primary Behavior:`);
    instructions.push(
      `- Answer questions using ONLY the information from your knowledge base`
    );
    instructions.push(`- Provide accurate, well-structured responses`);
    instructions.push(`- Maintain a helpful and professional tone`);

    // Conditional instructions based on config
    if (this.config.allowRelatedQuestions) {
      instructions.push(
        `- If a question is related but not exact, draw connections from available information`
      );
    }

    if (this.config.responseFormat === "structured") {
      instructions.push(
        `- Format responses with clear structure using headings and bullet points`
      );
    } else if (this.config.responseFormat === "concise") {
      instructions.push(`- Keep responses brief and to the point`);
    }

    // Confidence handling
    instructions.push(`### Confidence Levels:`);
    instructions.push(`- 🟢 High confidence: Direct match in knowledge base`);
    instructions.push(
      `- 🟡 Medium confidence: Inferred from related information`
    );
    instructions.push(`- 🔴 Low confidence: Limited or uncertain information`);

    // Fallback behavior
    instructions.push(`### When Information is Unavailable:`);
    switch (this.config.fallbackBehavior) {
      case "refuse":
        instructions.push(
          `- Politely decline to answer questions outside your knowledge base`
        );
        break;
      case "clarify":
        instructions.push(
          `- Ask for clarification or suggest related topics you can help with`
        );
        break;
      case "suggest":
        instructions.push(
          `- Suggest alternative questions or related information you can provide`
        );
        break;
    }

    return instructions.join("\n");
  }

  private buildExamples(data: DataStructure): string {
    if (
      !this.config.includeExamples ||
      !data.questions ||
      data.questions.length === 0
    ) {
      return "";
    }

    const examples = [`## RESPONSE EXAMPLES`];

    // Take first 2 questions as examples

    if (data.questions.length < 2) return "";
    const exampleQuestions = data.questions.slice(0, 2);

    exampleQuestions.forEach((q, index) => {
      examples.push(`### Example ${index + 1}:`);
      examples.push(`**User:** ${q.question}`);
      examples.push(`**Assistant:** ${q.answer}`);
      examples.push("");
    });

    return examples.join("\n");
  }
private buildConstraints(): string {
  const constraints = [`## OPERATIONAL CONSTRAINTS`];

  if (this.config.strictMode) {
    constraints.push(
      `- STRICT MODE: Only answer questions with direct matches in the knowledge base`
    );
  }

  constraints.push(`- Never fabricate or hallucinate information`);
  constraints.push(`- Always indicate your confidence level`);
  constraints.push(`- Cite specific knowledge base entries when possible`);
  
  // New constraint added below
  constraints.push(`- Do not repeat or rewrite the prompt enhancer; only provide the correct answer`);

  if (this.config.priority === "safety") {
    constraints.push(`- Prioritize safety and accuracy over helpfulness`);
  } else if (this.config.priority === "helpfulness") {
    constraints.push(
      `- Be as helpful as possible within your knowledge constraints`
    );
  }

  return constraints.join("\n");
}


  private buildUserQuery(userPrompt: string): string {
    return `## USER QUERY
${userPrompt}

---
Please provide a comprehensive response based on your knowledge base. Include your confidence level and cite relevant sources from your knowledge base.`;
  }

  private categorizeQuestions(
    questions: Question[]
  ): Record<string, Array<Question>> {
    const categories: Record<string, Array<Question>> = {};

    questions.forEach((q) => {
      const category = q.category || "General";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(q);
    });

    return categories;
  }

  private getConfidenceIndicator(confidence: number): string {
    if (confidence >= 0.9) return "🟢";
    if (confidence >= 0.7) return "🟡";
    return "🔴";
  }
  static createConfig(useCase: useCase): PromptConfig {
    switch (useCase) {
      case "customer-support":
        return {
          strictMode: false,
          allowRelatedQuestions: true,
          responseFormat: "detailed",
          fallbackBehavior: "clarify",
          priority: "helpfulness",
        };

      case "documentation":
        return {
          strictMode: false,
          allowRelatedQuestions: true,
          responseFormat: "structured",
          fallbackBehavior: "suggest",
          priority: "accuracy",
        };

      case "qa-bot":
        return {
          strictMode: false,
          allowRelatedQuestions: true,
          responseFormat: "concise",
          fallbackBehavior: "clarify",
          priority: "accuracy",
        };

      case "strict-compliance":
        return {
          strictMode: true,
          allowRelatedQuestions: false,
          responseFormat: "structured",
          fallbackBehavior: "refuse",
          priority: "safety",
        };

      default:
        return {};
    }
  }
}
export function createEnhancedPrompt(
  userPrompt: string,
  data: any,
  config?: PromptConfig
): string {
  const enhancer = new AdvancedPromptEnhancer(config ?? {});
  return enhancer.enhancePrompt(userPrompt, data);
}

export const createCustomerSupportPrompt = (userPrompt: string, data: any) =>
  createEnhancedPrompt(
    userPrompt,
    data,
    AdvancedPromptEnhancer.createConfig("customer-support")
  );
export const createDocumentationPrompt = (userPrompt: string, data: any) =>
  createEnhancedPrompt(
    userPrompt,
    data,
    AdvancedPromptEnhancer.createConfig("documentation")
  );

export const createQABotPrompt = (userPrompt: string, data: any) =>
  createEnhancedPrompt(
    userPrompt,
    data,
    AdvancedPromptEnhancer.createConfig("qa-bot")
  );

export const createCompliancePrompt = (userPrompt: string, data: any) =>
  createEnhancedPrompt(
    userPrompt,
    data,
    AdvancedPromptEnhancer.createConfig("strict-compliance")
  );

export const getEnhancePromptByUseCase = (useCase: useCase) => {
  switch (useCase) {
    case "customer-support":
      return createCustomerSupportPrompt;
    case "documentation":
      return createDocumentationPrompt;
    case "qa-bot":
      return createQABotPrompt;
    case "strict-compliance":
      return createCompliancePrompt;
    default:
      return createCustomerSupportPrompt;
  }
};
