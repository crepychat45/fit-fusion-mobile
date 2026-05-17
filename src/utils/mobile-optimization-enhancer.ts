/**
 * Mobile Optimization Enhancer v6.2.5
 * Comprehensive mobile device enhancements
 */

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  orientation: 'portrait' | 'landscape';
  userAgent: string;
  supportsTouch: boolean;
  supportsBiometric: boolean;
  hasNotchOrIslandDisplay: boolean;
}

interface MobileOptimizationConfig {
  enableTouchOptimization: boolean;
  enableSafeAreaInsets: boolean;
  enableHapticFeedback: boolean;
  autoAdjustFontSize: boolean;
  enableKeyboardAvoidance: boolean;
}

class MobileOptimizationEnhancer {
  private deviceInfo: DeviceInfo | null = null;
  private config: MobileOptimizationConfig = {
    enableTouchOptimization: true,
    enableSafeAreaInsets: true,
    enableHapticFeedback: true,
    autoAdjustFontSize: true,
    enableKeyboardAvoidance: true,
  };

  /**
   * Detect device type and capabilities
   */
  detectDevice(): DeviceInfo {
    if (this.deviceInfo) return this.deviceInfo;

    const userAgent = navigator.userAgent;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;

    // Detect if mobile
    const isMobileRegex =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isMobile = isMobileRegex.test(userAgent) && screenWidth < 768;
    const isTablet =
      isMobileRegex.test(userAgent) && screenWidth >= 768 && screenWidth < 1024;
    const isDesktop = !isMobile && !isTablet;

    // Detect touch support
    const supportsTouch =
      () =>
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0;

    // Detect biometric support (synchronous check)
    let supportsBiometricCheck = false;
    if ('PublicKeyCredential' in window) {
      supportsBiometricCheck = typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
    }

    // Detect notch/island display
    const hasNotchOrIslandDisplay =
      CSS.supports('(padding: max(0px))') ||
      // Detect Dynamic Island on iPhone 14 Pro
      (screenWidth === 393 && screenHeight === 852) ||
      (screenWidth === 375 && screenHeight === 812);

    this.deviceInfo = {
      isMobile,
      isTablet,
      isDesktop,
      screenWidth,
      screenHeight,
      pixelRatio,
      orientation: screenWidth > screenHeight ? 'landscape' : 'portrait',
      userAgent,
      supportsTouch: supportsTouch(),
      supportsBiometric: supportsBiometricCheck,
      hasNotchOrIslandDisplay,
    };

    return this.deviceInfo as DeviceInfo;
  }

  /**
   * Get safe area insets for notched devices
   */
  getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number } {
    const env = (name: string) => {
      const value = CSS.supports(`(padding: env(${name}))`)
        ? getComputedStyle(document.documentElement).getPropertyValue(`--safe-area-${name}`)
        : '0';
      return parseInt(value) || 0;
    };

    return {
      top: env('top') || 0,
      bottom: env('bottom') || 0,
      left: env('left') || 0,
      right: env('right') || 0,
    };
  }

  /**
   * Apply safe area CSS variables
   */
  applySafeAreaVariables(): void {
    const insets = this.getSafeAreaInsets();
    const root = document.documentElement;

    root.style.setProperty('--safe-area-top', `${insets.top}px`);
    root.style.setProperty('--safe-area-bottom', `${insets.bottom}px`);
    root.style.setProperty('--safe-area-left', `${insets.left}px`);
    root.style.setProperty('--safe-area-right', `${insets.right}px`);
  }

  /**
   * Trigger haptic feedback
   */
  triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'medium'): void {
    if (
      !this.config.enableHapticFeedback ||
      !('vibrate' in navigator)
    ) {
      return;
    }

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
    };

    navigator.vibrate(patterns[type]);
  }

  /**
   * Optimize touch event handling
   */
  setupTouchOptimization(): void {
    if (!this.config.enableTouchOptimization) return;

    // Disable double-tap zoom on buttons and links
    document.addEventListener('touchstart', (e) => {
      if (
        e.target instanceof HTMLElement &&
        (e.target.tagName === 'BUTTON' ||
          e.target.tagName === 'A' ||
          e.target.closest('button') ||
          e.target.closest('a'))
      ) {
        // Prevent default double-tap zoom
        (e.target as HTMLElement).style.touchAction = 'manipulation';
      }
    });

    // Add pointer events support for better touch performance
    document.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') {
        const element = e.target as HTMLElement;
        element?.classList.add('touch-active');
      }
    });

    document.addEventListener('pointerup', (e) => {
      const element = e.target as HTMLElement;
      element?.classList.remove('touch-active');
    });
  }

  /**
   * Handle keyboard avoidance
   */
  setupKeyboardAvoidance(): void {
    if (!this.config.enableKeyboardAvoidance) return;

    const handleResize = () => {
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.clientHeight;

      if (documentHeight > viewportHeight) {
        // Keyboard is shown
        document.body.classList.add('keyboard-visible');
      } else {
        // Keyboard is hidden
        document.body.classList.remove('keyboard-visible');
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Also handle focus/blur on inputs
    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
      }
    });
  }

  /**
   * Auto-adjust font size based on viewport
   */
  autoAdjustFontSize(): void {
    if (!this.config.autoAdjustFontSize) return;

    const updateFontSize = () => {
      const screenWidth = window.innerWidth;
      const baseFontSize = 16;

      // Scale factor based on viewport width
      let scaleFactor = 1;
      if (screenWidth < 375) {
        scaleFactor = 0.9; // Small phones
      } else if (screenWidth < 768) {
        scaleFactor = 1; // Standard phones
      } else if (screenWidth < 1024) {
        scaleFactor = 1.1; // Tablets
      } else {
        scaleFactor = 1.2; // Desktop
      }

      document.documentElement.style.fontSize = `${baseFontSize * scaleFactor}px`;
    };

    updateFontSize();
    window.addEventListener('resize', updateFontSize);
    window.addEventListener('orientationchange', updateFontSize);
  }

  /**
   * Detect network status and adjust quality
   */
  async detectNetworkStatus(): Promise<'4g' | '3g' | '2g' | 'slow-2g' | 'unknown'> {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  /**
   * Optimize images for mobile
   */
  optimizeImagesForMobile(): void {
    const device = this.detectDevice();
    const images = document.querySelectorAll('img');

    images.forEach((img) => {
      // Set max-width to prevent overflow
      img.style.maxWidth = '100%';
      img.style.height = 'auto';

      // Adjust image quality based on device pixel ratio
      if (img.dataset.src) {
        const srcset = img.dataset.src
          .split(',')
          .map((src: string) => {
            const [url, descriptor] = src.trim().split(' ');
            const newUrl = url.includes('?')
              ? `${url}&dpr=${device.pixelRatio}`
              : `${url}?dpr=${device.pixelRatio}`;
            return `${newUrl} ${descriptor}`;
          })
          .join(',');

        img.srcset = srcset;
      }
    });
  }

  /**
   * Setup viewport meta tag
   */
  setupViewportMeta(): void {
    let viewport = document.querySelector('meta[name="viewport"]');

    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      document.head.appendChild(viewport);
    }

    viewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, viewport-fit=cover, minimum-scale=1.0, maximum-scale=5.0, user-scalable=yes'
    );
  }

  /**
   * Initialize all mobile optimizations
   */
  initialize(config?: Partial<MobileOptimizationConfig>): void {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.setupViewportMeta();
    this.applySafeAreaVariables();
    this.setupTouchOptimization();
    this.setupKeyboardAvoidance();
    this.autoAdjustFontSize();
    this.optimizeImagesForMobile();

    console.log('✅ Mobile optimization initialized');
  }
}

export const mobileOptimizationEnhancer = new MobileOptimizationEnhancer();
export type { DeviceInfo, MobileOptimizationConfig };
