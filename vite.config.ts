/// <reference types="vitest" />

import * as path from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      $: path.resolve(__dirname, "emails")
    }
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./setup-tests.ts"]
  }
})
