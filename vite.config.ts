import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { resourceHintsPlugin } from "./vite-plugin-resource-hints";
import { criticalCSSPlugin } from "./vite-plugin-critical-css";
import { asyncCSSPlugin } from "./vite-plugin-async-css";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    mode === "production" && asyncCSSPlugin(), // Must be first to catch CSS links
    mode === "production" && resourceHintsPlugin(),
    mode === "production" && criticalCSSPlugin(),
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
    cssCodeSplit: true, // Enable CSS code splitting per route
    cssMinify: 'lightningcss', // Use lightningcss for better CSS minification
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
          
          // Radix UI components - split by component for better caching
          if (id.includes('@radix-ui/')) {
            const match = id.match(/@radix-ui\/react-([^/]+)/);
            if (match) {
              return `ui-radix-${match[1]}`;
            }
            return 'ui-radix';
          }
          
          // Animation libraries - defer loading
          if (id.includes('framer-motion')) {
            return 'vendor-motion';
          }
          
          // Icons - split separately
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
          
          // Supabase - split into separate chunk
          if (id.includes('@supabase/')) {
            return 'vendor-supabase';
          }
          
          // React Query - split into separate chunk
          if (id.includes('@tanstack/react-query')) {
            return 'vendor-query';
          }
          
          // Chart libraries - defer loading (heavy dependency)
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
          
          // Split pages into separate chunks for route-based code splitting
          if (id.includes('src/pages/')) {
            const match = id.match(/pages\/([^/]+)/);
            if (match) {
              return `page-${match[1].replace('.tsx', '').replace('.ts', '')}`;
            }
          }
          
          // Split large component groups
          if (id.includes('src/components/chat/')) {
            return 'features-chat';
          }
          if (id.includes('src/components/dashboard/')) {
            return 'features-dashboard';
          }
          if (id.includes('src/components/settings/')) {
            return 'features-settings';
          }
          if (id.includes('src/components/ai/') || id.includes('src/components/mobile/')) {
            return 'features-advanced';
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
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
        passes: 2,
        unsafe_arrows: true,
        unsafe_methods: true,
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
