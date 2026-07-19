/**
 * App Initializer
 * Initializes all enhancements on app startup
 */

import { APP_VERSION } from '@/lib/app-version';
import { performanceEnhancer } from './performance-enhancer';
import { mobileOptimizationEnhancer } from './mobile-optimization-enhancer';
import { securityEnhancer } from './security-enhancer';
import { aiEnhancer } from './ai-enhancer';

export class AppInitializer {
  private static initialized = false;

  /**
   * Initialize all app enhancements
   */
  static async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('⚠️ App already initialized');
      return;
    }

    try {
      console.log(`🚀 Initializing FitFusion v${APP_VERSION}...`);

      // 1. Initialize Performance Enhancements
      this.initializePerformance();

      // 2. Initialize Mobile Optimizations
      this.initializeMobileOptimizations();

      // 3. Initialize Security Enhancements
      this.initializeSecurity();

      // 4. Initialize AI Enhancements
      this.initializeAI();

      // 5. Register Service Worker
      await this.registerServiceWorker();

      // 6. Setup monitoring
      this.setupMonitoring();

      // 7. Setup event listeners
      this.setupEventListeners();

      this.initialized = true;

      console.log(`✅ FitFusion v${APP_VERSION} initialized successfully!`);
      console.log('📊 Features enabled:');
      console.log('   - ⚡ Performance optimization');
      console.log('   - 📱 Mobile optimization');
      console.log('   - 🔒 Security enhancements');
      console.log('   - 🤖 AI improvements');
      console.log('   - 🌐 Service Worker support');
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      // Continue anyway - don't block app startup
    }
  }

  /**
   * Initialize performance enhancements
   */
  private static initializePerformance(): void {
    console.log('⏱️ Initializing performance enhancements...');

    // Setup lazy loading for images
    if ('IntersectionObserver' in window) {
      const images = document.querySelectorAll('img[data-src]');
      images.forEach((img) => {
        performanceEnhancer.setupLazyLoading(img, () => {
          const src = img.getAttribute('data-src');
          if (src) {
            img.setAttribute('src', src);
            img.removeAttribute('data-src');
          }
        });
      });
    }

    // Prefetch common resources
    performanceEnhancer.prefetchResource('/index.html', 'fetch');

    console.log('   ✅ Performance enhancements initialized');
  }

  /**
   * Initialize mobile optimizations
   */
  private static initializeMobileOptimizations(): void {
    console.log('📱 Initializing mobile optimizations...');

    mobileOptimizationEnhancer.initialize({
      enableTouchOptimization: true,
      enableSafeAreaInsets: true,
      enableHapticFeedback: true,
      autoAdjustFontSize: true,
      enableKeyboardAvoidance: true,
    });

    // Log device info
    const device = mobileOptimizationEnhancer.detectDevice();
    console.log(`   📊 Device: ${device.isMobile ? 'Mobile' : device.isTablet ? 'Tablet' : 'Desktop'}`);
    console.log(`   📐 Resolution: ${device.screenWidth}x${device.screenHeight}`);
    console.log(`   🖱️ Touch support: ${device.supportsTouch ? 'Yes' : 'No'}`);
  }

  /**
   * Initialize security enhancements
   */
  private static initializeSecurity(): void {
    console.log('🔒 Initializing security enhancements...');

    securityEnhancer.initialize({
      enableCSP: true,
      enableHSTS: true,
      enableXSSProtection: true,
      enableClickjacking: true,
      enableContentTypeSniffing: true,
      enforceHTTPS: true,
    });

    // Log security status
    const status = securityEnhancer.verifyAppSecurity();
    console.log(`   🛡️ Security patches applied: ${status.totalPatches}/${status.totalPatches}`);
    console.log(`   ⚠️ Critical issues: ${status.criticalIssues}`);
  }

  /**
   * Initialize AI enhancements
   */
  private static initializeAI(): void {
    console.log('🤖 Initializing AI enhancements...');

    // Get user info from localStorage or context
    const userId = localStorage.getItem('user-id') || 'guest';
    const userStats = {
      totalWorkouts: parseInt(localStorage.getItem('total-workouts') || '0'),
      favoriteExercise: localStorage.getItem('favorite-exercise') || 'general',
      fitnessLevel: (localStorage.getItem('fitness-level') || 'intermediate') as any,
    };

    aiEnhancer.initializeContext(userId, userStats);
    console.log('   ✅ AI context initialized');
  }

  /**
   * Register Service Worker
   */
  private static async registerServiceWorker(): Promise<void> {
    try {
      if (!('serviceWorker' in navigator)) return;

      const host = window.location.hostname;
      const isPreview =
        host === 'lovableproject.com' ||
        host.endsWith('.lovableproject.com') ||
        host === 'lovableproject-dev.com' ||
        host.endsWith('.lovableproject-dev.com') ||
        host.startsWith('id-preview--') ||
        window.self !== window.top ||
        new URLSearchParams(window.location.search).get('sw') === 'off';

      if (isPreview || import.meta.env.DEV) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.allSettled(registrations.map((registration) => registration.unregister()));
        return;
      }

      // Run after startup only; no blocking HEAD request before registration.
      await performanceEnhancer.registerServiceWorker();
    } catch (error) {
      console.log('ℹ️ Service Worker not available:', error);
    }
  }

  /**
   * Setup monitoring
   */
  private static setupMonitoring(): void {
    console.log('📊 Setting up monitoring...');

    // Only monitor slow ops in production; dev pre-bundling & HMR create false positives.
    // Only observe long tasks & navigation; resource entries are noisy on slow networks
    // and cached/prefetched requests report inflated durations. Suppress unless explicitly enabled.
    const perfDebug = (() => {
      try { return localStorage.getItem('fitfusion:perf-debug') === '1'; } catch { return false; }
    })();
    if (import.meta.env.PROD && perfDebug && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Ignore resource entries — they include queued prefetches with misleading durations.
            if (entry.entryType === 'resource') continue;
            if (entry.duration > 3000) {
              console.warn(`⚠️ Slow operation detected: ${entry.name} (${entry.duration.toFixed(0)}ms)`);
            }
          }
        });
        observer.observe({ entryTypes: ['measure', 'navigation', 'longtask'] as any });
      } catch {
        // no-op
      }
    }


    // Monitor memory
    if ((performance as any).memory) {
      const mem = (performance as any).memory;
      console.log(
        `💾 Memory: ${(mem.usedJSHeapSize / 1048576).toFixed(2)}MB / ${(mem.jsHeapSizeLimit / 1048576).toFixed(2)}MB`
      );
    }
  }

  /**
   * Setup event listeners
   */
  private static setupEventListeners(): void {
    // Listen for online/offline
    window.addEventListener('online', () => {
      console.log('🌐 Online');
      // Trigger sync if needed
    });

    window.addEventListener('offline', () => {
      console.log('📡 Offline - app will use cached data');
    });

    // Listen for visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('👀 App backgrounded');
      } else {
        console.log('👁️ App foregrounded');
      }
    });

    // Handle app crashes/errors
    window.addEventListener('error', (event) => {
      console.error('🔥 Uncaught error:', event.error);
      // Could send to error tracking service
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('🔥 Unhandled promise rejection:', event.reason);
    });
  }

  /**
   * Get initialization status
   */
  static getStatus(): {
    initialized: boolean;
    timestamp: Date;
    version: string;
    features: string[];
  } {
    return {
      initialized: this.initialized,
      timestamp: new Date(),
      version: '6.2.5',
      features: [
        'Performance Optimization',
        'Mobile Optimization',
        'Security Enhancement',
        'AI Improvement',
        'Service Worker',
        'Monitoring',
      ],
    };
  }

  /**
   * Run diagnostics
   */
  static runDiagnostics(): void {
    console.log('🔍 Running FitFusion diagnostics...');

    const device = mobileOptimizationEnhancer.detectDevice();
    const security = securityEnhancer.verifyAppSecurity();
    const metrics = performanceEnhancer.getAverageMetrics();
    const cacheStats = performanceEnhancer.getCacheStats();

    console.log('\n📱 Device Information:');
    console.log(`  Platform: ${device.userAgent.substring(0, 50)}...`);
    console.log(`  Screen: ${device.screenWidth}x${device.screenHeight} @ ${device.pixelRatio}x`);

    console.log('\n🔒 Security Status:');
    console.log(`  All patched: ${security.allPatched}`);
    console.log(`  Critical issues: ${security.criticalIssues}`);

    console.log('\n⚡ Performance Metrics:');
    console.log(`  Average load time: ${(metrics.loadTime || 0).toFixed(2)}ms`);
    console.log(`  Average render time: ${(metrics.renderTime || 0).toFixed(2)}ms`);

    console.log('\n💾 Cache Statistics:');
    console.log(`  Items: ${cacheStats.items}`);
    console.log(`  Size: ${(cacheStats.size / 1024).toFixed(2)}KB`);

    console.log('\n✅ Diagnostics complete!');
  }
}

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  // Initialize after a short delay to ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      AppInitializer.initialize();
    });
  } else {
    // DOM is already loaded
    Promise.resolve().then(() => AppInitializer.initialize());
  }
}

export default AppInitializer;
