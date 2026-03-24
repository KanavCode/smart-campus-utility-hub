import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    // Drop console and debugger in production
    drop: mode === "production" ? ["console", "debugger"] : [],
    // Legal comments handling
    legalComments: "none",
    // Minify identifiers in production
    minifyIdentifiers: mode === "production",
    // Minify syntax in production
    minifySyntax: mode === "production",
    // Minify whitespace in production
    minifyWhitespace: mode === "production",
    // Target modern browsers
    target: "es2020",
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020",
    },
  },
  build: {
    target: "es2020",
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
            return "react-core";
          }
          if (id.includes("@tanstack") || id.includes("axios")) {
            return "data-layer";
          }
          if (id.includes("three") || id.includes("@react-three") || id.includes("@react-spring") || id.includes("maath")) {
            return "3d-stack";
          }
          if (id.includes("framer-motion")) {
            return "motion";
          }
          if (id.includes("@radix-ui") || id.includes("lucide-react") || id.includes("class-variance-authority") || id.includes("tailwind-merge")) {
            return "ui-kit";
          }
          return "vendor";
        },
      },
    },
    // Keep warning strict enough to catch regressions early
    chunkSizeWarningLimit: 700,
  },
}));
