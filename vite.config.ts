
import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), dts({ rollupTypes: true })],
  server: {
    fs: {
      strict: true,
    },
  },
  optimizeDeps: {
    include: ["react-chat-ai-widget"],
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "React-Chat-Widget",
      // the proper extensions will be added
      fileName: "React-Chat-Widget",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        assetFileNames: ({ name }) => {
          if (
            name &&
            name.includes("React-Chat-Widget") &&
            name.endsWith(".css")
          ) {
            return "style.css";
          }
          return "[name].[ext]";
        },
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "react/jsx-runtime",
        },
      },
    },
  },
});
