import { supabase } from '@/integrations/supabase/client';

export type AnalyticsEvent =
  | 'workout_started'
  | 'workout_completed'
  | 'workout_paused'
  | 'exercise_completed'
  | 'goal_created'
  | 'goal_achieved'
  | 'post_created'
  | 'post_liked'
  | 'comment_added'
  | 'challenge_joined'
  | 'profile_updated'
  | 'achievement_unlocked'
  | 'app_installed'
  | 'notification_clicked'
  | 'page_view'
  | 'session_start'
  | 'session_end';

export interface AnalyticsEventData {
  event: AnalyticsEvent;
  timestamp: string;
  user_id?: string;
  properties?: Record<string, any>;
  page?: string;
  referrer?: string;
  device?: string;
  session_id?: string;
}

class Analytics {
  private sessionId: string;
  private sessionStart: number;
  private events: AnalyticsEventData[] = [];
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();
    this.setupAutoFlush();
    this.trackSessionStart();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  private setupAutoFlush() {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.trackSessionEnd();
        this.flush();
      });
    }
  }

  async track(event: AnalyticsEvent, properties?: Record<string, any>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const eventData: AnalyticsEventData = {
        event,
        timestamp: new Date().toISOString(),
        user_id: user?.id,
        properties,
        page: typeof window !== 'undefined' ? window.location.pathname : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        device: this.getDeviceInfo(),
        session_id: this.sessionId,
      };

      this.events.push(eventData);

      // Flush immediately for important events
      if (this.shouldFlushImmediately(event)) {
        await this.flush();
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  private shouldFlushImmediately(event: AnalyticsEvent): boolean {
    const immediateEvents: AnalyticsEvent[] = [
      'workout_completed',
      'goal_achieved',
      'achievement_unlocked',
      'session_end',
    ];
    return immediateEvents.includes(event);
  }

  async flush() {
    if (this.events.length === 0) return;

    try {
      const eventsToSend = [...this.events];
      this.events = [];

      await (supabase.from as any)('analytics_events').insert(eventsToSend);
    } catch (error) {
      console.error('Error flushing analytics:', error);
      // Re-add events back if flush failed
      this.events = [...this.events, ...this.events];
    }
  }

  trackSessionStart() {
    this.track('session_start', {
      sessionId: this.sessionId,
    });
  }

  trackSessionEnd() {
    const sessionDuration = Date.now() - this.sessionStart;
    this.track('session_end', {
      sessionId: this.sessionId,
      duration: sessionDuration,
    });
  }

  trackPageView(page?: string) {
    this.track('page_view', {
      page: page || (typeof window !== 'undefined' ? window.location.pathname : undefined),
    });
  }

  trackWorkoutEvent(
    event: 'workout_started' | 'workout_completed' | 'workout_paused',
    workoutData: {
      workoutId?: string;
      duration?: number;
      exercises?: number;
      caloriesBurned?: number;
    }
  ) {
    this.track(event, workoutData);
  }

  trackSocialEvent(
    event: 'post_created' | 'post_liked' | 'comment_added',
    data: {
      postId?: string;
      userId?: string;
      contentLength?: number;
    }
  ) {
    this.track(event, data);
  }

  trackGoalEvent(
    event: 'goal_created' | 'goal_achieved',
    goalData: {
      goalType: string;
      targetValue?: number;
      currentValue?: number;
    }
  ) {
    this.track(event, goalData);
  }

  trackAchievement(achievementName: string, metadata?: Record<string, any>) {
    this.track('achievement_unlocked', {
      achievementName,
      ...metadata,
    });
  }

  private getDeviceInfo(): string {
    if (typeof navigator === 'undefined') return 'unknown';
    
    const ua = navigator.userAgent;
    
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  // Get analytics summary
  async getAnalyticsSummary(startDate?: Date, endDate?: Date) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      let query = (supabase.from as any)('analytics_events')
        .select('*')
        .eq('user_id', user.id);

      if (startDate) {
        query = query.gte('timestamp', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('timestamp', endDate.toISOString());
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Process analytics data
      const summary = {
        totalEvents: data.length,
        workoutsCompleted: data.filter((e: any) => e.event === 'workout_completed').length,
        goalsAchieved: data.filter((e: any) => e.event === 'goal_achieved').length,
        achievementsUnlocked: data.filter((e: any) => e.event === 'achievement_unlocked').length,
        socialInteractions: data.filter((e: any) => 
          ['post_created', 'post_liked', 'comment_added'].includes(e.event)
        ).length,
      };

      return summary;
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      return null;
    }
  }

  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Export singleton instance
export const analytics = new Analytics();
