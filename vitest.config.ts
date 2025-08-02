import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

console.log("Vitest config file loaded");
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom", // ← Esto es crucial
    globals: true,
    setupFiles: "./setupTests.ts",
  },
});
