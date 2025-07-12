import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      // Fix for React 19 readonly property error
      treeshake: {
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
  },
});
