import { defineConfig } from "vitest/config";
import { config } from "dotenv";

// Load .env.test for test environment
config({ path: ".env.test" });

export default defineConfig({
  test: {
    environment: "node",
  },
});
