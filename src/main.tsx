import reactDom from "react-dom/client";

import App from "./app";
import "./style.css";

const root = reactDom.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(<App />);
