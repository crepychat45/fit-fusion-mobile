/**
 * Feature flags system for controlled rollout of features
 */

interface FeatureFlags {
  pushNotifications: boolean;
  advancedAnalytics: boolean;
  aiWorkoutRecommendations: boolean;
  socialFeatures: boolean;
  offlineMode: boolean;
  videoWorkouts: boolean;
  customWorkoutBuilder: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  pushNotifications: true,
  advancedAnalytics: true,
  aiWorkoutRecommendations: false,
  socialFeatures: true,
  offlineMode: true,
  videoWorkouts: true,
  customWorkoutBuilder: true,
};

class FeatureFlagManager {
  private flags: FeatureFlags;
  private overrides: Partial<FeatureFlags> = {};

  constructor() {
    this.flags = { ...DEFAULT_FLAGS };
    this.loadOverrides();
  }

  private loadOverrides() {
    // Load from localStorage for development/testing
    const stored = localStorage.getItem('feature-flags');
    if (stored) {
      try {
        this.overrides = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse feature flags from localStorage');
      }
    }

    // Load from URL params (for testing)
    const params = new URLSearchParams(window.location.search);
    const urlFlags = params.get('flags');
    if (urlFlags) {
      try {
        const parsed = JSON.parse(atob(urlFlags));
        this.overrides = { ...this.overrides, ...parsed };
      } catch (e) {
        console.error('Failed to parse feature flags from URL');
      }
    }
  }

  isEnabled(feature: keyof FeatureFlags): boolean {
    return this.overrides[feature] ?? this.flags[feature] ?? false;
  }

  enable(feature: keyof FeatureFlags) {
    this.overrides[feature] = true;
    this.saveOverrides();
  }

  disable(feature: keyof FeatureFlags) {
    this.overrides[feature] = false;
    this.saveOverrides();
  }

  toggle(feature: keyof FeatureFlags) {
    this.overrides[feature] = !this.isEnabled(feature);
    this.saveOverrides();
  }

  private saveOverrides() {
    localStorage.setItem('feature-flags', JSON.stringify(this.overrides));
  }

  reset() {
    this.overrides = {};
    localStorage.removeItem('feature-flags');
  }

  getAllFlags(): FeatureFlags {
    return {
      ...this.flags,
      ...this.overrides,
    };
  }
}

// Export singleton instance
export const featureFlags = new FeatureFlagManager();

// React hook for feature flags
export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  return featureFlags.isEnabled(feature);
}
