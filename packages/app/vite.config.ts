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
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
      treeshake: {
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        annotations: false,
      },
      onwarn(warning, warn) {
        // Suppress readonly property warnings
        if (
          warning.code === "CIRCULAR_DEPENDENCY" ||
          warning.message?.includes("readonly") ||
          warning.message?.includes("property")
        ) {
          return;
        }
        warn(warning);
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  esbuild: {
    target: "es2020",
    legalComments: "none",
  },
});
