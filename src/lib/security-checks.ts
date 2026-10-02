import { supabase } from "@/integrations/supabase/client";

export type SecurityCheck = { id: string; label: string; passed: boolean; tip: string };

const has = (k: string) => {
  try {
    const v = localStorage.getItem(k);
    return Boolean(v && v !== "false" && v !== "null" && v !== "[]");
  } catch {
    return false;
  }
};

/** Real, device-observable security checks. No invented threats or scores. */
export async function runSecurityChecks(): Promise<{ checks: SecurityCheck[]; score: number }> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  let mfa = false;
  try {
    const f = await supabase.auth.mfa.listFactors();
    mfa = (f.data?.totp?.length ?? 0) > 0;
  } catch {
    /* not available */
  }
  const ageH = session ? (Date.now() / 1000 - (session.expires_at ?? 0) + 3600) / 3600 : 0;
  const notif = typeof Notification !== "undefined" ? Notification.permission : "default";
  const checks: SecurityCheck[] = [
    { id: "https", label: "Secure connection (HTTPS)", passed: location.protocol === "https:" || location.hostname === "localhost", tip: "Open the app over https." },
    { id: "signed-in", label: "Signed in to your account", passed: Boolean(session), tip: "Sign in to protect and sync your data." },
    { id: "email", label: "Email verified", passed: Boolean(session?.user?.email_confirmed_at), tip: "Confirm your email address." },
    { id: "mfa", label: "Two-step verification", passed: mfa || has("fitfusion.totp"), tip: "Turn on two-step verification in Security." },
    { id: "app-lock", label: "App lock enabled", passed: has("fitfusion.appLock") || has("fitfusion-app-lock"), tip: "Turn on App Lock with PIN or biometrics." },
    { id: "passkey", label: "Passkey saved", passed: has("fitfusion.passkeys") || has("fitfusion-passkeys"), tip: "Add a passkey for password-free sign in." },
    { id: "sw", label: "Offline protection installed", passed: Boolean(navigator.serviceWorker?.controller), tip: "Install the app to enable offline protection." },
    { id: "notif", label: "Security alerts allowed", passed: notif === "granted", tip: "Allow notifications to receive alerts." },
    { id: "fresh", label: "Recent sign-in", passed: !session || ageH < 24 * 30, tip: "Sign in again to refresh your session." },
  ];
  const score = Math.round((checks.filter((c) => c.passed).length / checks.length) * 100);
  return { checks, score };
}
