import react from "@vitejs/plugin-react"
import * as path from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      $: path.resolve(__dirname, "emails")
    }
  },
  test: {
    pool: "vmThreads",
    deps: {
      web: {
        transformCss: true
      }
    },
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./setup-tests.ts"]
  }
})
