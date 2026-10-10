import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

// https://vitejs.dev/config/
const BUILD_ID = `${Date.now().toString(36)}`;
const APP_VER = JSON.parse(fs.readFileSync("./package.json", "utf8")).version;
const versionJsonPlugin = () => ({
  name: "fitx-version-json",
  generateBundle(this: any) {
    this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify({ version: APP_VER, buildId: BUILD_ID, builtAt: new Date().toISOString() }) });
  },
});

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    strictPort: true,
    warmup: {
      clientFiles: ["./src/main.tsx", "./src/App.tsx", "./src/pages/Index.tsx"],
    },
  },
  plugins: [react(), versionJsonPlugin(), mode === "development" && componentTagger(), mcpPlugin()].filter(
    Boolean,
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  define: {
    global: "globalThis",
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  optimizeDeps: {
    include: [
      "react",
      "react/jsx-runtime",
      "react-dom",
      "react-dom/client",
      "react-router-dom",
      "@supabase/supabase-js",
      "@radix-ui/react-dialog",
      "@radix-ui/react-slot",
      "@radix-ui/react-avatar",
      "@radix-ui/react-label",
      "@radix-ui/react-switch",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-popover",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-toast",
      "framer-motion",
      "lucide-react",
      "@tanstack/react-query",
      "date-fns",
      "zod",
      "react-hook-form",
      "@hookform/resolvers",
      "recharts",
      "react-day-picker",
      "clsx",
      "tailwind-merge",
      "class-variance-authority",
    ],
  },

  build: {
    sourcemap: false,
    cssMinify: true,
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Keep React, React-DOM, scheduler, and anything that touches
            // React internals (recharts, radix, framer-motion, router, query)
            // in a single vendor chunk to guarantee React is initialized
            // before any consumer accesses React.Children / hooks.
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/react-is/') ||
              id.includes('/scheduler/') ||
              id.includes('/react-router') ||
              id.includes('@radix-ui') ||
              id.includes('framer-motion') ||
              id.includes('recharts') ||
              id.includes('/d3-') ||
              id.includes('@tanstack')
            ) {
              return 'vendor-react';
            }
            if (id.includes('lucide')) return 'vendor-icons';
            if (id.includes('@supabase')) return 'vendor-supabase';
          }
        }
      }
    }
  },
}));
