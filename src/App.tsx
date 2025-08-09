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
          { question: "Explain a simple machine learning" },
          {
            question: "What is the difference between?",
          },
        ]}
        huggingface="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"
        data={{
          questions: [
            {
              question:
                "what are the hours of close or open in the InsightFlow",
              answer:
                "the hours of close or open in the InsightFlow are Monday to Friday from 10am to 4pm",
              category: "general",
              confidence: 0.9,
            },
          ],
          useCase: "customer-support",
        }}
      ></ChatWidget>

      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
    </div>
  );
};

export default App;
