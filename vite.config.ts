import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    strictPort: true,
    warmup: {
      clientFiles: ["./src/main.tsx", "./src/App.tsx", "./src/pages/Index.tsx"],
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
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
      "framer-motion",
      "lucide-react",
      "@tanstack/react-query"
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
            if (id.includes('react-dom')) return 'vendor-react-dom';
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('@radix-ui')) return 'vendor-radix';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('recharts') || id.includes('d3')) return 'vendor-charts';
            if (id.includes('lucide')) return 'vendor-icons';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('@tanstack')) return 'vendor-query';
          }
        }
      }
    }
  },
}));
