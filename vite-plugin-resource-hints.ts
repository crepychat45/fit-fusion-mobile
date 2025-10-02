import { Plugin } from 'vite';

/**
 * Vite plugin to automatically inject resource hints for critical chunks
 * This reduces network dependency tree depth and improves load times
 */
export function resourceHintsPlugin(): Plugin {
  return {
    name: 'resource-hints-plugin',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        // Only apply in production builds
        if (ctx.bundle) {
          const criticalChunks = ['vendor-react', 'vendor-router'];
          const prefetchChunks = ['vendor-motion', 'ui-radix', 'vendor-icons'];
          
          // Generate modulepreload hints for critical chunks
          const modulepreloadLinks = Object.keys(ctx.bundle)
            .filter((fileName) => {
              return criticalChunks.some((chunk) => fileName.includes(chunk));
            })
            .map((fileName) => {
              return `<link rel="modulepreload" href="/${fileName}" crossorigin>`;
            })
            .join('\n    ');
          
          // Generate prefetch hints for non-critical chunks
          const prefetchLinks = Object.keys(ctx.bundle)
            .filter((fileName) => {
              return prefetchChunks.some((chunk) => fileName.includes(chunk));
            })
            .map((fileName) => {
              return `<link rel="prefetch" href="/${fileName}" as="script">`;
            })
            .join('\n    ');
          
          // Inject hints before closing head tag
          if (modulepreloadLinks) {
            html = html.replace(
              '</head>',
              `    <!-- Critical resource hints -->\n    ${modulepreloadLinks}\n    </head>`
            );
          }
          
          if (prefetchLinks) {
            html = html.replace(
              '</head>',
              `    <!-- Prefetch non-critical resources -->\n    ${prefetchLinks}\n    </head>`
            );
          }
        }
        
        return html;
      },
    },
  };
}
