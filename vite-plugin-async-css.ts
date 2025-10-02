import { Plugin } from 'vite';

/**
 * Vite plugin to make CSS non-render-blocking using the proven media="print" technique
 * This is the most reliable method across all browsers
 */
export function asyncCSSPlugin(): Plugin {
  return {
    name: 'async-css-plugin',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        // Replace all stylesheet links with non-blocking media="print" pattern
        // This works by initially loading CSS with media="print" (non-blocking)
        // Then switching to media="all" once loaded
        
        html = html.replace(
          /<link\s+([^>]*?)rel="stylesheet"([^>]*?)>/gi,
          (match, before, after) => {
            // Extract href
            const hrefMatch = (before + after).match(/href="([^"]+)"/);
            if (!hrefMatch) return match;
            
            const href = hrefMatch[1];
            
            // Skip if already has media="print" or is external
            if (match.includes('media="print"') || !href.includes('.css')) {
              return match;
            }
            
            // Create non-blocking link with media trick
            return `<link rel="stylesheet" href="${href}" media="print" onload="this.media='all'" crossorigin>
    <noscript><link rel="stylesheet" href="${href}" crossorigin></noscript>`;
          }
        );

        return html;
      },
    },
  };
}
