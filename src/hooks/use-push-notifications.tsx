import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscriptionJSON | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      
      if (sub) {
        setIsSubscribed(true);
        setSubscription(sub.toJSON());
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const subscribe = async () => {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast({
          title: 'Permission Denied',
          description: 'Please enable notifications to receive updates.',
          variant: 'destructive',
        });
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Generate VAPID public key (in production, this should come from your server)
      const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY';
      
      const vapidKey = urlBase64ToUint8Array(vapidPublicKey);
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: new Uint8Array(vapidKey),
      });

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const subscriptionData = sub.toJSON();
        
        // Store subscription using generic Database type
        await supabase
          .from('push_subscriptions' as any)
          .upsert({
            user_id: user.id,
            subscription: subscriptionData,
            endpoint: subscriptionData.endpoint,
          } as any);

        setIsSubscribed(true);
        setSubscription(subscriptionData);

        toast({
          title: 'Subscribed!',
          description: 'You will now receive push notifications.',
        });
        
        return true;
      }
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast({
        title: 'Subscription Failed',
        description: 'Could not enable push notifications.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      
      if (sub) {
        await sub.unsubscribe();
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          await supabase
            .from('push_subscriptions' as any)
            .delete()
            .eq('user_id', user.id);
        }

        setIsSubscribed(false);
        setSubscription(null);

        toast({
          title: 'Unsubscribed',
          description: 'Push notifications have been disabled.',
        });
        
        return true;
      }
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      toast({
        title: 'Unsubscribe Failed',
        description: 'Could not disable push notifications.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const scheduleNotification = async (
    title: string,
    body: string,
    scheduledTime: Date,
    data?: Record<string, any>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      await supabase
        .from('scheduled_notifications' as any)
        .insert({
          user_id: user.id,
          title,
          body,
          scheduled_for: scheduledTime.toISOString(),
          data: data || {},
        } as any);

      toast({
        title: 'Reminder Set',
        description: 'You will receive a notification at the scheduled time.',
      });
      
      return true;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      toast({
        title: 'Schedule Failed',
        description: 'Could not schedule the notification.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscription,
    subscribe,
    unsubscribe,
    scheduleNotification,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}
