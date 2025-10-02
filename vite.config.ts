import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { resourceHintsPlugin } from "./vite-plugin-resource-hints";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    mode === "production" && resourceHintsPlugin()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    include: [
      "react", 
      "react-dom", 
      "react-router-dom",
      "@radix-ui/react-dialog", 
      "@radix-ui/react-slot",
      "framer-motion",
      "lucide-react",
      "@tanstack/react-query"
    ],
  },
  build: {
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React libraries
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          
          // Router
          if (id.includes('node_modules/react-router-dom/')) {
            return 'vendor-router';
          }
          
          // Radix UI components - split by component
          if (id.includes('@radix-ui/')) {
            const match = id.match(/@radix-ui\/react-([^/]+)/);
            if (match) {
              return `ui-radix-${match[1]}`;
            }
            return 'ui-radix';
          }
          
          // Animation libraries
          if (id.includes('framer-motion')) {
            return 'vendor-motion';
          }
          
          // Icons
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
          
          // Supabase
          if (id.includes('@supabase/')) {
            return 'vendor-supabase';
          }
          
          // React Query
          if (id.includes('@tanstack/react-query')) {
            return 'vendor-query';
          }
          
          // Chart libraries
          if (id.includes('recharts')) {
            return 'vendor-charts';
          }
          
          // Form libraries
          if (id.includes('react-hook-form') || id.includes('@hookform/')) {
            return 'vendor-forms';
          }
          
          // Date libraries
          if (id.includes('date-fns')) {
            return 'vendor-dates';
          }
          
          // Other node_modules
          if (id.includes('node_modules')) {
            return 'vendor-other';
          }
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.');
          const ext = info?.[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/css/i.test(ext || '')) {
            return `assets/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
        passes: 2
      },
      format: {
        comments: false
      },
      mangle: {
        safari10: true
      }
    },
    chunkSizeWarningLimit: 500
  },
}));
