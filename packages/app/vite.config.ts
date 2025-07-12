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
      // Fix for readonly property error in Docker/CI environments
      treeshake: {
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
      // Additional configuration to handle strict mode differences
      output: {
        manualChunks: undefined,
      },
    },
    // Target ES2020 for better compatibility
    target: "es2020",
    // Use esbuild for faster builds
    minify: "esbuild",
  },
  // Ensure consistent behavior across environments
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    // Force pre-bundling of problematic dependencies
    include: ["react", "react-dom"],
  },
});
