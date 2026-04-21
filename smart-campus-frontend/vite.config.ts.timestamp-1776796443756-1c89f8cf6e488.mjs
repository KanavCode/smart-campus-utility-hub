// vite.config.ts
import { defineConfig } from "file:///C:/Users/hp/smart-campus-utility-hub/smart-campus-frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/hp/smart-campus-utility-hub/smart-campus-frontend/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/hp/smart-campus-utility-hub/smart-campus-frontend/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\hp\\smart-campus-utility-hub\\smart-campus-frontend";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
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
    target: "es2020"
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020"
    }
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
        }
      }
    },
    // Keep warning strict enough to catch regressions early
    chunkSizeWarningLimit: 700
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxocFxcXFxzbWFydC1jYW1wdXMtdXRpbGl0eS1odWJcXFxcc21hcnQtY2FtcHVzLWZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxocFxcXFxzbWFydC1jYW1wdXMtdXRpbGl0eS1odWJcXFxcc21hcnQtY2FtcHVzLWZyb250ZW5kXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9ocC9zbWFydC1jYW1wdXMtdXRpbGl0eS1odWIvc21hcnQtY2FtcHVzLWZyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCI6OlwiLFxyXG4gICAgcG9ydDogODA4MCxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBtb2RlID09PSBcImRldmVsb3BtZW50XCIgJiYgY29tcG9uZW50VGFnZ2VyKCldLmZpbHRlcihCb29sZWFuKSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBlc2J1aWxkOiB7XHJcbiAgICAvLyBEcm9wIGNvbnNvbGUgYW5kIGRlYnVnZ2VyIGluIHByb2R1Y3Rpb25cclxuICAgIGRyb3A6IG1vZGUgPT09IFwicHJvZHVjdGlvblwiID8gW1wiY29uc29sZVwiLCBcImRlYnVnZ2VyXCJdIDogW10sXHJcbiAgICAvLyBMZWdhbCBjb21tZW50cyBoYW5kbGluZ1xyXG4gICAgbGVnYWxDb21tZW50czogXCJub25lXCIsXHJcbiAgICAvLyBNaW5pZnkgaWRlbnRpZmllcnMgaW4gcHJvZHVjdGlvblxyXG4gICAgbWluaWZ5SWRlbnRpZmllcnM6IG1vZGUgPT09IFwicHJvZHVjdGlvblwiLFxyXG4gICAgLy8gTWluaWZ5IHN5bnRheCBpbiBwcm9kdWN0aW9uXHJcbiAgICBtaW5pZnlTeW50YXg6IG1vZGUgPT09IFwicHJvZHVjdGlvblwiLFxyXG4gICAgLy8gTWluaWZ5IHdoaXRlc3BhY2UgaW4gcHJvZHVjdGlvblxyXG4gICAgbWluaWZ5V2hpdGVzcGFjZTogbW9kZSA9PT0gXCJwcm9kdWN0aW9uXCIsXHJcbiAgICAvLyBUYXJnZXQgbW9kZXJuIGJyb3dzZXJzXHJcbiAgICB0YXJnZXQ6IFwiZXMyMDIwXCIsXHJcbiAgfSxcclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIGVzYnVpbGRPcHRpb25zOiB7XHJcbiAgICAgIHRhcmdldDogXCJlczIwMjBcIixcclxuICAgIH0sXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgdGFyZ2V0OiBcImVzMjAyMFwiLFxyXG4gICAgbWluaWZ5OiBcImVzYnVpbGRcIixcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgbWFudWFsQ2h1bmtzKGlkKSB7XHJcbiAgICAgICAgICBpZiAoIWlkLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzXCIpKSByZXR1cm47XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJyZWFjdFwiKSB8fCBpZC5pbmNsdWRlcyhcInJlYWN0LWRvbVwiKSB8fCBpZC5pbmNsdWRlcyhcInJlYWN0LXJvdXRlclwiKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJyZWFjdC1jb3JlXCI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJAdGFuc3RhY2tcIikgfHwgaWQuaW5jbHVkZXMoXCJheGlvc1wiKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJkYXRhLWxheWVyXCI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJ0aHJlZVwiKSB8fCBpZC5pbmNsdWRlcyhcIkByZWFjdC10aHJlZVwiKSB8fCBpZC5pbmNsdWRlcyhcIkByZWFjdC1zcHJpbmdcIikgfHwgaWQuaW5jbHVkZXMoXCJtYWF0aFwiKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCIzZC1zdGFja1wiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiZnJhbWVyLW1vdGlvblwiKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJtb3Rpb25cIjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIkByYWRpeC11aVwiKSB8fCBpZC5pbmNsdWRlcyhcImx1Y2lkZS1yZWFjdFwiKSB8fCBpZC5pbmNsdWRlcyhcImNsYXNzLXZhcmlhbmNlLWF1dGhvcml0eVwiKSB8fCBpZC5pbmNsdWRlcyhcInRhaWx3aW5kLW1lcmdlXCIpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcInVpLWtpdFwiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIFwidmVuZG9yXCI7XHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICAvLyBLZWVwIHdhcm5pbmcgc3RyaWN0IGVub3VnaCB0byBjYXRjaCByZWdyZXNzaW9ucyBlYXJseVxyXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA3MDAsXHJcbiAgfSxcclxufSkpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTBXLFNBQVMsb0JBQW9CO0FBQ3ZZLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLGlCQUFpQixnQkFBZ0IsQ0FBQyxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQzlFLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQTtBQUFBLElBRVAsTUFBTSxTQUFTLGVBQWUsQ0FBQyxXQUFXLFVBQVUsSUFBSSxDQUFDO0FBQUE7QUFBQSxJQUV6RCxlQUFlO0FBQUE7QUFBQSxJQUVmLG1CQUFtQixTQUFTO0FBQUE7QUFBQSxJQUU1QixjQUFjLFNBQVM7QUFBQTtBQUFBLElBRXZCLGtCQUFrQixTQUFTO0FBQUE7QUFBQSxJQUUzQixRQUFRO0FBQUEsRUFDVjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osZ0JBQWdCO0FBQUEsTUFDZCxRQUFRO0FBQUEsSUFDVjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGFBQWEsSUFBSTtBQUNmLGNBQUksQ0FBQyxHQUFHLFNBQVMsY0FBYyxFQUFHO0FBQ2xDLGNBQUksR0FBRyxTQUFTLE9BQU8sS0FBSyxHQUFHLFNBQVMsV0FBVyxLQUFLLEdBQUcsU0FBUyxjQUFjLEdBQUc7QUFDbkYsbUJBQU87QUFBQSxVQUNUO0FBQ0EsY0FBSSxHQUFHLFNBQVMsV0FBVyxLQUFLLEdBQUcsU0FBUyxPQUFPLEdBQUc7QUFDcEQsbUJBQU87QUFBQSxVQUNUO0FBQ0EsY0FBSSxHQUFHLFNBQVMsT0FBTyxLQUFLLEdBQUcsU0FBUyxjQUFjLEtBQUssR0FBRyxTQUFTLGVBQWUsS0FBSyxHQUFHLFNBQVMsT0FBTyxHQUFHO0FBQy9HLG1CQUFPO0FBQUEsVUFDVDtBQUNBLGNBQUksR0FBRyxTQUFTLGVBQWUsR0FBRztBQUNoQyxtQkFBTztBQUFBLFVBQ1Q7QUFDQSxjQUFJLEdBQUcsU0FBUyxXQUFXLEtBQUssR0FBRyxTQUFTLGNBQWMsS0FBSyxHQUFHLFNBQVMsMEJBQTBCLEtBQUssR0FBRyxTQUFTLGdCQUFnQixHQUFHO0FBQ3ZJLG1CQUFPO0FBQUEsVUFDVDtBQUNBLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUVBLHVCQUF1QjtBQUFBLEVBQ3pCO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
