/**
 * Bundle size analyzer utilities
 * Helps identify large dependencies and optimize bundle size
 */

interface BundleStats {
  totalSize: number;
  resources: {
    name: string;
    size: number;
    type: string;
  }[];
}

export function analyzeBundleSize(): BundleStats {
  const resources = performance
    .getEntriesByType('resource')
    .filter((resource: any) => 
      resource.name.includes('.js') || 
      resource.name.includes('.css')
    ) as PerformanceResourceTiming[];

  const bundleResources = resources.map((resource: any) => ({
    name: resource.name.split('/').pop() || 'unknown',
    size: resource.transferSize || 0,
    type: resource.name.includes('.js') ? 'javascript' : 'css',
  }));

  const totalSize = bundleResources.reduce((acc, r) => acc + r.size, 0);

  return {
    totalSize,
    resources: bundleResources.sort((a, b) => b.size - a.size),
  };
}

/**
 * Check for large dependencies
 */
export function checkLargeDependencies(threshold = 500 * 1024): string[] {
  const stats = analyzeBundleSize();
  return stats.resources
    .filter(r => r.size > threshold)
    .map(r => `${r.name} (${(r.size / 1024).toFixed(2)} KB)`);
}

/**
 * Generate bundle optimization recommendations
 */
export function getBundleOptimizationTips(): string[] {
  const tips: string[] = [];
  const stats = analyzeBundleSize();
  
  const totalKB = stats.totalSize / 1024;
  
  if (totalKB > 500) {
    tips.push('Total bundle size exceeds 500KB. Consider code splitting.');
  }
  
  const largeFiles = stats.resources.filter(r => r.size > 200 * 1024);
  if (largeFiles.length > 0) {
    tips.push(`Found ${largeFiles.length} files larger than 200KB. Consider lazy loading.`);
  }
  
  const jsFiles = stats.resources.filter(r => r.type === 'javascript');
  if (jsFiles.length > 20) {
    tips.push('Consider bundling or merging smaller JavaScript files.');
  }
  
  return tips;
}

/**
 * Log bundle analysis to console
 */
export function logBundleAnalysis() {
  const stats = analyzeBundleSize();
  
  console.group('📦 Bundle Analysis');
  console.log(`Total Size: ${(stats.totalSize / 1024).toFixed(2)} KB`);
  console.log('\nLargest Files:');
  
  stats.resources.slice(0, 10).forEach((resource, i) => {
    console.log(
      `${i + 1}. ${resource.name} (${(resource.size / 1024).toFixed(2)} KB)`
    );
  });
  
  const tips = getBundleOptimizationTips();
  if (tips.length > 0) {
    console.log('\n💡 Optimization Tips:');
    tips.forEach(tip => console.log(`  - ${tip}`));
  }
  
  console.groupEnd();
}
