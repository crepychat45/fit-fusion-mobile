// Type definitions for notification-related tables

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  subscription: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ScheduledNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  scheduled_for: string;
  sent_at: string | null;
  data: Record<string, any>;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event: string;
  timestamp: string;
  user_id: string | null;
  properties: Record<string, any>;
  page: string | null;
  referrer: string | null;
  device: string | null;
  session_id: string | null;
  created_at: string;
}
