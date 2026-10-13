import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  // Components import each other through the package name; point it at the source (Turbopack does this in the app)
  resolve: { alias: { "@fewtone/ui": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "jsdom",
    // jsdom starts slowly when every file boots it at once; the first test in a file pays for it
    testTimeout: 30_000,
    include: ["src/**/*.test.tsx"],
    setupFiles: ["./src/test/setup.ts"],
  },
});
