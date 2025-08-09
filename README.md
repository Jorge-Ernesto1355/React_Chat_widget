# 🤖 React Chat AI Widget

**React Chat AI Widget** is a plug-and-play React component that lets you embed a fully customizable, intelligent chatbot into your app — with zero backend setup required.

It supports **Hugging Face** or **Replicate** APIs for real-time AI responses, making it ideal for customer support, onboarding, FAQs, smart documentation bots, and more.

[![npm](https://img.shields.io/npm/v/react-chat-ai-widget)](https://www.npmjs.com/package/react-chat-ai-widget)
[![downloads](https://img.shields.io/npm/dw/react-chat-ai-widget)](https://www.npmjs.com/package/react-chat-ai-widget)
[![license](https://img.shields.io/npm/l/react-chat-ai-widget)](https://github.com/jorge-ernesto1355/react-chat-ai-widget/blob/main/LICENSE)

---

## ✨ Features

- 🤖 AI chatbot powered by Hugging Face or Replicate
- ⚡ No backend needed – fully client-side with secure token proxy
- 🎯 Behavior-aware via use cases (e.g. support, documentation, etc.)
- 🧩 Built with React + TypeScript
- 🎨 Fully customizable UI and styles
- 🔐 Tokens are secured — never exposed to the client
- 🧪 Ready for testing with Vitest and Cypress

---

## 📦 Installation

```bash
npm install react-chat-ai-widget
```

---

```tsx
import { ChatWidget } from "react-chat-ai-widget";

<ChatWidget
  title="InsightFlow"
  direction="left" // or "right" (default)
  huggingface="YOUR_HUGGINGFACE_TOKEN"
  Loader={<Loader />}
  initialQuestions={[{ question: "What is the price of this product?" }]}
  // replicate="YOUR_REPLICATE_TOKEN" (use one or the other)
  config={{
    temperature: 0.7,
    max_tokens: 200,
    top_p: 0.9,
    frequency_penalty: 0.5,
    model: "microsoft/DialoGPT-large",
    stop_sequences: ["\n\n", "Human:", "Bot:"],
  }}
  //replicate and huggingFace has different config
  data={{
    useCase: "customer-support",
    questions: [
      {
        question: "What are your business hours?",
        answer: "We’re open Monday to Friday from 10am to 4pm.",
        category: "general",
        confidence: 0.98,
      },
      {
        question: "Who wrote Don Quixote?",
        answer: "Miguel de Cervantes.",
        category: "literature",
        confidence: 0.92,
      },
    ],
  }}
  chatStyles={{}}
  formStyles={{
    inputStyles: {},
    buttonStyles: {},
    formStyles: {},
  }}
>
  <div>open chat</div>
</ChatWidget>;
```

---

## 🎨 Styling

To ensure the **ChatWidget** renders properly, import the style file in your main entry point:

```js
import "react-chat-ai-widget/style.css";
```

You can customize the layout using either class names or inline style objects.

---

## 🧩 Component Props

| Prop              | Type   | Required    | Description                                               |
| ----------------- | ------ | ----------- | --------------------------------------------------------- |
| `title`           | string | No          | Chat header title. Defaults to `"AI Assistant"`.          |
| `data`            | object | Yes         | Contains pre-defined Q&A and optional use case.           |
| `Loader`          | React  | No          | Custom loader component. render when the chat is loading. |
| `huggingface`     | string | Conditional | Your Hugging Face API token. Do not use with `replicate`. |
| `replicate`       | string | Conditional | Your Replicate API token. Do not use with `huggingface`.  |
| `direction`       | string | No          | `"left"` or `"right"`. Default is `"right"`.              |
| `chatClassName`   | string | No          | Custom class for chat container.                          |
| `chatStyles`      | object | No          | Inline styles for chat container.                         |
| `headerClassName` | string | No          | Custom class for header.                                  |
| `headerStyles`    | object | No          | Inline styles for header section.                         |
| `formStyles`      | object | No          | Object containing style overrides for the form.           |
| └ `inputStyles`   | object | No          | Styles for the input field.                               |
| └ `buttonStyles`  | object | No          | Styles for the submit button.                             |
| └ `formStyles`    | object | No          | Styles for the entire form container.                     |
| `config`          | object | No          | Configuration for the AI service.                         |
| `children`        | React  | No          | Custom children component. render chat opener.            |

### `initialQuestions`

An array of objects containing the initial questions to be displayed in the chat interface.

---

## 🧠 Data Format

Define a list of questions and answers the chatbot can use, with an optional `useCase` to control tone or behavior.

```ts
{
  useCase: "qa-bot", // or "customer-support", "documentation", "strict-compliance"
  questions: [
    {
      question: "Your question here?",
      answer: "The chatbot response.",
      category: "general",
      confidence: 0.85 // Value between 0 and 1
    },
    // Add as many as needed
  ]
}
```

### Supported `useCase` values

- `"customer-support"`: Friendly, helpful support tone
- `"documentation"`: Technical, concise answers
- `"qa-bot"`: Default Q&A with open logic
- `"strict-compliance"`: Controlled, policy-aware responses

---

## 🔐 Token Security

Your API tokens are never exposed to the client.

- ✅ Hugging Face or Replicate tokens are sent securely through a proxy
- ✅ No direct client-to-model communication
- ✅ Fully encrypted and safe

---

## 🖼️ Chat Preview

| Chat aligned left                                                                                     | Chat aligned right                                                                                      |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| ![Left Chat](https://res.cloudinary.com/dfetriigs/image/upload/v1752553509/ChatWidgetLeft_cgkvyd.png) | ![Right Chat](https://res.cloudinary.com/dfetriigs/image/upload/v1752553562/ChatWidgetRight_i58qen.png) |

---

### 🔧 Advanced Model Configuration

Take full control of your AI's behavior with comprehensive model customization options:

#### 🎛️ **Core Parameters**

- **`temperature`** _(0.0 - 2.0)_ - Controls response creativity and randomness
- `0.1` = Focused, deterministic responses
- `0.7` = Balanced creativity (recommended)
- `1.5` = Highly creative, varied outputs

- **`max_tokens`** _(1 - 4096)_ - Maximum response length
- `50` = Short, concise answers
- `150` = Standard responses
- `500+` = Detailed, comprehensive replies

#### 🎯 **Fine-Tuning Options**

- **`top_p`** _(0.0 - 1.0)_ - Nucleus sampling for response diversity
- **`frequency_penalty`** _(-2.0 - 2.0)_ - Reduces repetitive content
- **`presence_penalty`** _(-2.0 - 2.0)_ - Encourages topic exploration
- **`stop_sequences`** - Custom stop words to control response endings
- **`model`** - Choose specific AI models for different capabilities

#### 💡 **Example Configuration**

```tsx
config={{
 temperature: 0.7,
 max_tokens: 200,
 top_p: 0.9,
 frequency_penalty: 0.5,
 model: "microsoft/DialoGPT-large",
 stop_sequences: ["\n\n", "Human:", "Bot:"]
}}
```

---

## ⚠️ Notes

- Do **not** use both `huggingface` and `replicate` props at the same time.
- You must import the CSS file for the widget to render correctly.
- The `chatStyles` and `headerStyles` props override any class-based styles (`chatClassName`, `headerClassName`).

  ⚠️ Important Note for Hugging Face Users
  If you're using this chatbot with Hugging Face and plan to enable <thinking> mode (or similar streaming indicators), make sure to set max_tokens to at least 500 in your configuration.

  is necessary because <thinking> consumes a significant number of tokens during generation. If max_tokens is too low, the assistant's response might get cut off or fail to generate properly.

---

## 🧪 Testing

- Includes support for unit and UI testing using **Vitest** and **Cypress**.
- Example test commands:

```bash
npm run test        # Vitest
npm run dev         # Local dev mode
npm run lint        # ESLint
npm run build       # Production build
```

---

## 🚧 Upcoming Features

### 🛍️ Product Recommendation Engine

- The chatbot will soon be able to recommend products based on user questions, behavior, and preferences in real time.

- 🌐 Multi-language support

- 🌎 Internationalization (i18n)

- 📊 Analytics Dashboard (Q3 2024)
  Conversation insights and performance metrics.

- 🔗 Integration Plugins (Q4 2024)
  Direct integrations with popular platforms (Shopify, WordPress, etc.).

---

## 📄 License

MIT © [Jorge Ernesto](https://github.com/jorge-ernesto1355)

---
