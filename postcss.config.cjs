module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: ['advanced', {
          discardComments: { removeAll: true },
          normalizeWhitespace: true,
          colormin: true,
          convertValues: true,
          discardDuplicates: true,
          discardEmpty: true,
          discardUnused: true,
          mergeRules: true,
          minifyFontValues: true,
          minifySelectors: true,
          reduceIdents: false, // Keep animation names
          zindex: false, // Don't change z-index values
        }],
      },
    } : {}),
  },
};
