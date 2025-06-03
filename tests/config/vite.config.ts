import react from "@vitejs/plugin-react"
import * as path from "path"
import { defineConfig } from "vitest/config"

const cwd = process.cwd()

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(cwd, "src"),
      $: path.resolve(cwd, "emails"),
      testing: path.resolve(cwd, "testing")
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
    setupFiles: ["./testing/setup-tests.ts"],
    browser: {
      instances: [
        {
          browser: "firefox"
        }
      ]
    }
  }
})
