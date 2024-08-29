import { resolve } from "path"

import { defineConfig } from "vitest/config"

import react from "@vitejs/plugin-react"
 
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "./src") }]
  },
  test: {
    globals: true,
    setupFiles: ["vitest-setup.ts"],
    environment: "jsdom",
  },
})