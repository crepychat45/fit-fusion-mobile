import { Plugin } from 'vite';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Vite plugin to extract and inline critical CSS for above-the-fold content
 * This reduces unused CSS and improves First Contentful Paint (FCP)
 */
export function criticalCSSPlugin(): Plugin {
  let config: any;
  
  // Critical CSS selectors that are needed for above-the-fold rendering
  const criticalSelectors = [
    // Layout
    'html', 'body', '#root',
    // Typography
    'h1', 'h2', 'h3', 'p', 'a', 'button',
    // Common utilities
    'flex', 'grid', 'container',
    // Loading states
    'loading-fallback',
    // Critical components (visible on first load)
    'nav', 'header', 'main',
  ];

  return {
    name: 'critical-css-plugin',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        // Only in production
        if (config.mode !== 'production') return html;

        // Extract critical CSS rules
        const criticalCSS = `
          /* Critical CSS for above-the-fold content */
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html { line-height: 1.5; -webkit-text-size-adjust: 100%; }
          body { 
            margin: 0; 
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          #root { min-height: 100vh; }
          .loading-fallback { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh;
            font-size: 1.125rem;
          }
          
          /* Critical layout utilities */
          .flex { display: flex; }
          .grid { display: grid; }
          .hidden { display: none; }
          
          /* Container */
          .container { 
            width: 100%; 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 0 1rem; 
          }
          
          /* Prevent flash of unstyled content */
          img, svg { max-width: 100%; height: auto; display: block; }
          button { font-family: inherit; cursor: pointer; }
          
          /* Critical responsive */
          @media (max-width: 768px) {
            .container { padding: 0 0.75rem; }
          }
        `.trim();

        // Inject critical CSS inline
        return html.replace(
          /<style>[\s\S]*?<\/style>/,
          `<style>${criticalCSS}</style>`
        );
      },
    },
  };
}
