import { supabase } from "@/integrations/supabase/client";

/**
 * Robust sign-out used across Profile/Settings.
 *
 * Supabase can leave a stale token in storage when the network call fails or
 * the refresh token was already revoked (that made "Sign out of this device"
 * look like it did nothing). We therefore:
 *  1. attempt the API sign-out (never let it throw),
 *  2. purge every cached auth/session key locally,
 *  3. hard-navigate to /auth so no stale React state survives.
 */
export async function performSignOut(scope: "local" | "global" = "local"): Promise<void> {
  try {
    await supabase.auth.signOut({ scope });
  } catch {
    /* offline or already-revoked token — continue with the local purge */
  }

  purgeLocalAuthState();
}

export function purgeLocalAuthState(): void {
  const wipe = (store: Storage | undefined) => {
    if (!store) return;
    try {
      const keys: string[] = [];
      for (let i = 0; i < store.length; i += 1) {
        const k = store.key(i);
        if (!k) continue;
        if (/^sb-.*-auth-token/.test(k) || k.startsWith("supabase.auth.") || k === "fitfusion-session") {
          keys.push(k);
        }
      }
      keys.forEach((k) => store.removeItem(k));
    } catch {
      /* storage disabled */
    }
  };

  if (typeof window !== "undefined") {
    wipe(window.localStorage);
    wipe(window.sessionStorage);
  }
}

export function redirectToAuth(delayMs = 250): void {
  if (typeof window === "undefined") return;
  window.setTimeout(() => window.location.replace("/auth"), delayMs);
}

/** Sign out + purge + redirect. Returns after triggering navigation. */
export async function signOutAndRedirect(scope: "local" | "global" = "local"): Promise<void> {
  await performSignOut(scope);
  redirectToAuth();
}
