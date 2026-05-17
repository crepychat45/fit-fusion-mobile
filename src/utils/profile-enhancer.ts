/**
 * Enhanced Profile Features v6.2.5
 * New profile features and customization options
 */

export interface ProfileBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ProfileStats {
  totalWorkouts: number;
  totalCaloriesBurned: number;
  totalMinutesExercised: number;
  streakDays: number;
  personalRecords: number;
  friendsCount: number;
}

export interface ProfileTheme {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  backgroundPattern: string;
}

export const PROFILE_BADGES: ProfileBadge[] = [
  {
    id: 'first-workout',
    name: 'Getting Started',
    description: 'Complete your first workout',
    icon: '🏃',
    earned: true,
    earnedDate: new Date('2025-01-15'),
    rarity: 'common',
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Workout 7 days in a row',
    icon: '⚡',
    earned: true,
    earnedDate: new Date('2025-02-20'),
    rarity: 'rare',
  },
  {
    id: 'calorie-crusher',
    name: 'Calorie Crusher',
    description: 'Burn 10,000 calories',
    icon: '🔥',
    earned: true,
    earnedDate: new Date('2025-03-10'),
    rarity: 'epic',
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Add 10 friends',
    icon: '🦋',
    earned: false,
    rarity: 'rare',
  },
  {
    id: 'iron-will',
    name: 'Iron Will',
    description: '30-day perfect streak',
    icon: '💪',
    earned: false,
    rarity: 'legendary',
  },
  {
    id: 'trainer-pro',
    name: 'Trainer Pro',
    description: 'Use AI trainer 100 times',
    icon: '🤖',
    earned: true,
    earnedDate: new Date('2025-04-01'),
    rarity: 'epic',
  },
];

export const PROFILE_THEMES: ProfileTheme[] = [
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    primaryColor: '#0EA5E9',
    accentColor: '#06B6D4',
    backgroundPattern: 'radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.1), transparent)',
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    primaryColor: '#F97316',
    accentColor: '#FB923C',
    backgroundPattern: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(251, 146, 60, 0.1))',
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    primaryColor: '#22C55E',
    accentColor: '#84CC16',
    backgroundPattern: 'radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.1), transparent)',
  },
  {
    id: 'purple-mystic',
    name: 'Purple Mystic',
    primaryColor: '#A855F7',
    accentColor: '#D946EF',
    backgroundPattern: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(217, 70, 239, 0.1))',
  },
];

export class ProfileEnhancer {
  /**
   * Get profile badges for user
   */
  static getProfileBadges(userId: string): ProfileBadge[] {
    // In production, fetch from database
    return PROFILE_BADGES;
  }

  /**
   * Earn a new badge
   */
  static async earnBadge(userId: string, badgeId: string): Promise<ProfileBadge | null> {
    const badge = PROFILE_BADGES.find((b) => b.id === badgeId);
    if (badge) {
      badge.earned = true;
      badge.earnedDate = new Date();
      // In production, save to database
      return badge;
    }
    return null;
  }

  /**
   * Get profile statistics
   */
  static getProfileStats(userId: string): ProfileStats {
    // In production, fetch from database
    return {
      totalWorkouts: 127,
      totalCaloriesBurned: 42350,
      totalMinutesExercised: 3847,
      streakDays: 15,
      personalRecords: 8,
      friendsCount: 24,
    };
  }

  /**
   * Update profile statistics
   */
  static async updateProfileStats(
    userId: string,
    stats: Partial<ProfileStats>
  ): Promise<ProfileStats> {
    // In production, update in database
    return { ...this.getProfileStats(userId), ...stats };
  }

  /**
   * Calculate level based on experience
   */
  static calculateLevel(totalCaloriesBurned: number): { level: number; progress: number } {
    const caloriesPerLevel = 5000;
    const level = Math.floor(totalCaloriesBurned / caloriesPerLevel) + 1;
    const progress = (totalCaloriesBurned % caloriesPerLevel) / caloriesPerLevel;
    return { level, progress };
  }

  /**
   * Get achievement percentage
   */
  static getAchievementPercentage(): number {
    const earned = PROFILE_BADGES.filter((b) => b.earned).length;
    return Math.round((earned / PROFILE_BADGES.length) * 100);
  }

  /**
   * Get next achievable badge
   */
  static getNextBadge(): ProfileBadge | null {
    return PROFILE_BADGES.find((b) => !b.earned) || null;
  }

  /**
   * Get rarity color
   */
  static getRarityColor(rarity: string): string {
    const colors: Record<string, string> = {
      common: 'text-gray-500',
      rare: 'text-blue-500',
      epic: 'text-purple-500',
      legendary: 'text-yellow-500',
    };
    return colors[rarity] || colors.common;
  }

  /**
   * Get profile theme
   */
  static getTheme(themeId: string): ProfileTheme | undefined {
    return PROFILE_THEMES.find((t) => t.id === themeId);
  }

  /**
   * Apply profile theme
   */
  static applyTheme(theme: ProfileTheme): void {
    const root = document.documentElement;
    root.style.setProperty('--profile-primary', theme.primaryColor);
    root.style.setProperty('--profile-accent', theme.accentColor);
    root.style.setProperty(
      '--profile-background',
      theme.backgroundPattern
    );
    localStorage.setItem('profile-theme', theme.id);
  }

  /**
   * Get profile completion percentage
   */
  static getProfileCompletion(): number {
    // Check various profile fields
    let completedFields = 0;
    const totalFields = 6; // name, photo, bio, interests, social links, theme

    // In production, check actual user data
    completedFields = 4; // Example: 4 out of 6 fields filled

    return Math.round((completedFields / totalFields) * 100);
  }

  /**
   * Get profile sharing link
   */
  static getProfileShareLink(userId: string): string {
    return `${window.location.origin}/profile/${userId}`;
  }

  /**
   * Export profile as JSON
   */
  static exportProfile(
    userId: string,
    stats: ProfileStats,
    badges: ProfileBadge[]
  ): void {
    const profileData = {
      userId,
      exportDate: new Date().toISOString(),
      stats,
      badges,
    };

    const dataStr = JSON.stringify(profileData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

    const exportFileDefaultName = `fitfusion-profile-${userId}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
}

export default ProfileEnhancer;
