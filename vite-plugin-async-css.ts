import { Plugin } from 'vite';

/**
 * Vite plugin to make CSS non-render-blocking
 * Converts blocking CSS links to async loading pattern
 */
export function asyncCSSPlugin(): Plugin {
  return {
    name: 'async-css-plugin',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        // Replace blocking CSS links with non-blocking pattern
        // Pattern: <link rel="stylesheet" ... > becomes async loading
        html = html.replace(
          /<link\s+rel="stylesheet"\s+crossorigin\s+href="([^"]+\.css)"\s*\/?>/gi,
          (match, href) => {
            return `<link rel="preload" as="style" href="${href}" onload="this.onload=null;this.rel='stylesheet'" crossorigin>
    <noscript><link rel="stylesheet" href="${href}" crossorigin></noscript>`;
          }
        );

        // Also handle href-first pattern
        html = html.replace(
          /<link\s+href="([^"]+\.css)"\s+rel="stylesheet"\s+crossorigin\s*\/?>/gi,
          (match, href) => {
            return `<link rel="preload" as="style" href="${href}" onload="this.onload=null;this.rel='stylesheet'" crossorigin>
    <noscript><link rel="stylesheet" href="${href}" crossorigin></noscript>`;
          }
        );

        // Handle any remaining stylesheet links without crossorigin
        html = html.replace(
          /<link\s+(?:rel="stylesheet"\s+href="|href="([^"]+\.css)"\s+rel="stylesheet")([^>]*?)>/gi,
          (match, href) => {
            const url = href || match.match(/href="([^"]+\.css)"/)?.[1];
            if (url) {
              return `<link rel="preload" as="style" href="${url}" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="${url}"></noscript>`;
            }
            return match;
          }
        );

        return html;
      },
    },
  };
}
