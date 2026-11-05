import { PushNotifications } from "@capacitor/push-notifications";
import { supabase } from "@/integrations/supabase/client";

/** Registers this phone with Firebase Cloud Messaging and stores its token as `fcm:<token>`. */
export async function registerNativePush(): Promise<boolean> {
  let perm = await PushNotifications.checkPermissions();
  if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") perm = await PushNotifications.requestPermissions();
  if (perm.receive !== "granted") return false;

  const token = await new Promise<string | null>((resolve) => {
    const timer = setTimeout(() => resolve(null), 15000);
    PushNotifications.addListener("registration", (t) => { clearTimeout(timer); resolve(t.value); });
    PushNotifications.addListener("registrationError", () => { clearTimeout(timer); resolve(null); });
    PushNotifications.register();
  });
  if (!token) return false;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const endpoint = `fcm:${token}`;
  await supabase.from("push_subscriptions").delete().eq("user_id", user.id).eq("endpoint", endpoint);
  const { error } = await supabase.from("push_subscriptions").insert({ user_id: user.id, endpoint, p256dh: null, auth_key: null });
  return !error;
}
