/// <reference types="vitest/config" />
import path from "path";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tsconfigPaths(), react(), TanStackRouterVite()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@periods": path.resolve(__dirname, "./src/features/periods"),
      "@transactions": path.resolve(__dirname, "./src/features/transactions"),
    },
  },
});
