import { useState, useEffect, useCallback, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsVerification?: boolean }>;
  signOut: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  resendVerification: (email: string) => Promise<{ error: string | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
}

let authSnapshot: AuthState = {
  user: null,
  session: null,
  loading: true,
  error: null,
};

let authInitStarted = false;
const authListeners = new Set<(state: AuthState) => void>();

const withTimeout = async <T,>(promise: Promise<T>, ms = 2500): Promise<T> => {
  let timeoutId: number | undefined;
  const timeout = new Promise<T>((resolve) => {
    timeoutId = window.setTimeout(() => resolve({ data: { session: null }, error: null } as T), ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
};

const emitAuthState = (nextState: AuthState) => {
  authSnapshot = nextState;
  authListeners.forEach((listener) => listener(nextState));
};

const ensureAuthInitialized = () => {
  if (authInitStarted) return;
  authInitStarted = true;

  const authTimeout = window.setTimeout(() => {
    emitAuthState({
      ...authSnapshot,
      loading: false,
      error: authSnapshot.error ?? "Authentication is taking longer than expected.",
    });
  }, 2800);

  withTimeout(supabase.auth.getSession(), 2500)
    .then(({ data: { session }, error }) => {
      window.clearTimeout(authTimeout);
      emitAuthState(error
        ? { user: null, session: null, error: error.message, loading: false }
        : { session, user: session?.user ?? null, loading: false, error: null });
    })
    .catch((error) => {
      window.clearTimeout(authTimeout);
      emitAuthState({ user: null, session: null, error: error?.message ?? "Unable to restore session.", loading: false });
    });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    window.clearTimeout(authTimeout);
    emitAuthState({ session, user: session?.user ?? null, loading: false, error: null });

    window.dispatchEvent(new CustomEvent("fitfusion-auth-event", { detail: { event, userId: session?.user?.id ?? null } }));
  });

  window.addEventListener("pagehide", () => subscription.unsubscribe(), { once: true });
};

export function useEnhancedAuth(): AuthState & AuthActions {
  const [authState, setAuthState] = useState<AuthState>(authSnapshot);

  const { toast } = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    ensureAuthInitialized();
    authListeners.add(setAuthState);
    setAuthState(authSnapshot);

    const handleAuthEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ event: string; userId: string | null }>).detail;
      if (detail?.event === "SIGNED_IN" && detail.userId) {
        toastRef.current({ title: "Welcome back!", description: "You have been signed in successfully." });
      } else if (detail?.event === "SIGNED_OUT") {
        toastRef.current({ title: "Signed out", description: "You have been signed out successfully." });
      }
    };

    window.addEventListener("fitfusion-auth-event", handleAuthEvent);

    return () => {
      authListeners.delete(setAuthState);
      window.removeEventListener("fitfusion-auth-event", handleAuthEvent);
    };
  }, []); // No dependencies - stable effect

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const msg = error.message === "Failed to fetch"
          ? "Network error. Please check your connection."
          : error.message;
        setAuthState((prev) => ({ ...prev, error: msg, loading: false }));
        toastRef.current({ title: "Sign in failed", description: msg, variant: "destructive" });
        return { error: msg };
      }
      return { error: null };
    } catch (e: any) {
      const msg = e?.message?.includes("Failed to fetch")
        ? "Network error. Please check your connection."
        : "An unexpected error occurred. Please try again.";
      setAuthState((prev) => ({ ...prev, error: msg, loading: false }));
      toastRef.current({ title: "Sign in failed", description: msg, variant: "destructive" });
      return { error: msg };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl, data: { signupDate: new Date().toISOString() } },
      });
      if (error) {
        const msg = error.message === "Failed to fetch"
          ? "Network error. Please check your connection."
          : error.message;
        setAuthState((prev) => ({ ...prev, error: msg, loading: false }));
        toastRef.current({ title: "Sign up failed", description: msg, variant: "destructive" });
        return { error: msg };
      }
      const needsVerification = data.session === null && data.user !== null;
      if (needsVerification) {
        toastRef.current({ title: "Verify your email", description: "We've sent you a confirmation link. Click it to activate your account." });
      }
      setAuthState((prev) => ({ ...prev, loading: false, session: data.session, user: data.user }));
      return { error: null, needsVerification };
    } catch (e) {
      const msg = "An unexpected error occurred during sign up";
      setAuthState((prev) => ({ ...prev, error: msg, loading: false }));
      toastRef.current({ title: "Sign up failed", description: msg, variant: "destructive" });
      return { error: msg };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toastRef.current({ title: "Sign out failed", description: error.message, variant: "destructive" });
        return { error: error.message };
      }
      return { error: null };
    } catch (e) {
      const msg = "An unexpected error occurred during sign out";
      toastRef.current({ title: "Sign out failed", description: msg, variant: "destructive" });
      return { error: msg };
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toastRef.current({ title: "Password reset failed", description: error.message, variant: "destructive" });
        return { error: error.message };
      }
      toastRef.current({ title: "Password reset email sent", description: "Check your email for the reset link." });
      return { error: null };
    } catch (e) {
      const msg = "An unexpected error occurred during password reset";
      toastRef.current({ title: "Password reset failed", description: msg, variant: "destructive" });
      return { error: msg };
    }
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        toastRef.current({ title: "Resend failed", description: error.message, variant: "destructive" });
        return { error: error.message };
      }
      toastRef.current({ title: "Verification email sent", description: "Check your inbox for the confirmation link." });
      return { error: null };
    } catch (e: any) {
      const msg = e?.message ?? "Unable to resend verification email.";
      toastRef.current({ title: "Resend failed", description: msg, variant: "destructive" });
      return { error: msg };
    }
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback`, shouldCreateUser: true },
      });
      if (error) {
        toastRef.current({ title: "Magic link failed", description: error.message, variant: "destructive" });
        return { error: error.message };
      }
      toastRef.current({ title: "Magic link sent", description: "Check your email to sign in instantly." });
      return { error: null };
    } catch (e: any) {
      const msg = e?.message ?? "Unable to send magic link.";
      toastRef.current({ title: "Magic link failed", description: msg, variant: "destructive" });
      return { error: msg };
    }
  }, []);

  return { ...authState, signIn, signUp, signOut, resetPassword, resendVerification, signInWithMagicLink };
}
