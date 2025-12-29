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
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
}));
