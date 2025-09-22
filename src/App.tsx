import { ChatWidget } from "./Chat/ChatWidget";

const App = () => {
  return (
    <div className="grid place-items-center mt-96">
      <ChatWidget
        config={{
          model: "HuggingFaceTB/SmolLM3-3B",
          temperature: 0.7,
          max_tokens: 500,
          timeout: 30000,
          frequency_penalty: 0,
          top_p: 0,
        }}
        initialQuestions={[
          { question: "What is the CEO of Open AI" },
          {
            question: "What is the difference between apple and banana?",
          },
        ]}
        huggingface="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"
        data={{
          questions: [
            {
              question:
                "What is the CEO of Open AI",
              answer:
                "Sam Altman",
              category: "general",
              confidence: 0.9,
            },
            {
              question: "What is the difference between apple and banana?",
              answer:
                "Apples are typically sweet and crisp, while bananas are soft and creamy. Apples come in various colors like red, green, and yellow, whereas bananas are usually yellow when ripe.",
              category: "general",
            }
          ],
          useCase: "customer-support",
        }}
      >
        
      </ChatWidget>

      <br />
      
    </div>
  );
};

export default App;
