import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // DOM environment (browser API simulation)
    environment: "happy-dom",

    // Use describe, test, expect as globals
    globals: true,

    // Setup file to run before each test file
    setupFiles: "./test/setup.js",

    // Coverage settings
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json"],
      exclude: [
        "test/**",
        "**/*.config.js",
        "**/node_modules/**",
        "devtools.js",
      ],
      // Coverage thresholds (optional)
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },

    // Test timeout (milliseconds)
    testTimeout: 10000,
  },
});
