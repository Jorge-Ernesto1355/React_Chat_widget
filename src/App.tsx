import { ChatWidget } from "./Chat/ChatWidget";

const App = () => {
  const CustomLoader = () => {
    return <div>Custom Loader maricones</div>;
  };

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
        Loader={<CustomLoader />}
      >
        <button
          aria-label="children"
          className="bg-blue-500 text-white p-2 rounded-md"
        >
          Click me
        </button>
      </ChatWidget>

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
