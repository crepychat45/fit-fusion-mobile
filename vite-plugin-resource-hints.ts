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
          const jsFiles: string[] = [];
          const cssFiles: string[] = [];
          
          // Categorize all bundle files
          Object.entries(ctx.bundle).forEach(([fileName, chunk]) => {
            if (fileName.endsWith('.js')) {
              jsFiles.push(fileName);
            } else if (fileName.endsWith('.css')) {
              cssFiles.push(fileName);
            }
          });
          
          // Sort by size (largest first) to preload most critical chunks
          jsFiles.sort((a, b) => {
            if (!ctx.bundle) return 0;
            const sizeA = ctx.bundle[a]?.type === 'chunk' ? (ctx.bundle[a] as any).code?.length || 0 : 0;
            const sizeB = ctx.bundle[b]?.type === 'chunk' ? (ctx.bundle[b] as any).code?.length || 0 : 0;
            return sizeB - sizeA;
          });
          
          // Preload top 3 largest JS chunks (main entry + critical vendors)
          const criticalJsChunks = jsFiles.slice(0, 3);
          
          // Prefetch next 5 chunks
          const prefetchJsChunks = jsFiles.slice(3, 8);
          
          // Generate modulepreload hints for critical JS chunks
          const modulepreloadLinks = criticalJsChunks
            .map((fileName) => {
              return `<link rel="modulepreload" href="/${fileName}" crossorigin>`;
            })
            .join('\n    ');
          
          // Generate prefetch hints for non-critical chunks
          const prefetchLinks = prefetchJsChunks
            .map((fileName) => {
              return `<link rel="prefetch" href="/${fileName}" as="script">`;
            })
            .join('\n    ');
          
          // Inject hints before closing head tag
          if (modulepreloadLinks) {
            html = html.replace(
              '</head>',
              `    <!-- Critical resource hints - reduces network chain depth -->\n    ${modulepreloadLinks}\n    </head>`
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
