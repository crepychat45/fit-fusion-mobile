import { useState, useEffect } from "react";
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
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

export function useEnhancedAuth(): AuthState & AuthActions {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  const { toast } = useToast();

  useEffect(() => {
    // IMPORTANT: Set up auth state listener first before checking for existing session
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      setAuthState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
        error: null,
      }));

      // Handle auth events
      if (event === "SIGNED_IN") {
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });

        // Save user info for offline access and quick startup
        if (session?.user) {
          try {
            localStorage.setItem(
              "auth-user",
              JSON.stringify({
                id: session.user.id,
                email: session.user.email,
                name:
                  session.user.user_metadata?.name ||
                  session.user.user_metadata?.full_name ||
                  (session.user.email
                    ? session.user.email.split("@")[0]
                    : undefined),
                lastSignedIn: new Date().toISOString(),
              }),
            );
          } catch (e) {
            console.error("Error saving auth user info:", e);
          }
        }
      } else if (event === "SIGNED_OUT") {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      }
    });

    // Now check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log("Got existing session:", !!session);
      if (error) {
        setAuthState((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      } else {
        setAuthState((prev) => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
        }));
      }
    });

    // Set conservative session expiry check
    const checkSessionInterval = setInterval(
      async () => {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          console.log("Session check: No active session");
          setAuthState((prev) => ({
            ...prev,
            session: null,
            user: null,
          }));
        }
      },
      5 * 60 * 1000,
    ); // Check every 5 minutes

    return () => {
      subscription.unsubscribe();
      clearInterval(checkSessionInterval);
    };
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error.message);
        setAuthState((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return { error: error.message };
      }

      // Session will be handled by onAuthStateChange
      console.log("Sign in successful:", data.user?.id);
      return { error: null };
    } catch (unexpectedError) {
      const errorMsg = "An unexpected error occurred during sign in";
      console.error(errorMsg, unexpectedError);
      setAuthState((prev) => ({ ...prev, error: errorMsg, loading: false }));
      toast({
        title: "Sign in failed",
        description: errorMsg,
        variant: "destructive",
      });
      return { error: errorMsg };
    }
  };

  const signUp = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Get the current URL origin for proper redirects
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            signupDate: new Date().toISOString(),
          },
        },
      });

      if (error) {
        console.error("Sign up error:", error.message);
        setAuthState((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return { error: error.message };
      }

      // Check if email confirmation is required
      if (data.session === null && data.user !== null) {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link.",
        });
      }

      setAuthState((prev) => ({
        ...prev,
        loading: false,
        session: data.session,
        user: data.user,
      }));

      return { error: null };
    } catch (unexpectedError) {
      const errorMsg = "An unexpected error occurred during sign up";
      console.error(errorMsg, unexpectedError);
      setAuthState((prev) => ({ ...prev, error: errorMsg, loading: false }));
      toast({
        title: "Sign up failed",
        description: errorMsg,
        variant: "destructive",
      });
      return { error: errorMsg };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error.message);
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
        return { error: error.message };
      }

      // Also clear any user data from localStorage
      localStorage.removeItem("auth-user");

      // Session will be handled by onAuthStateChange
      return { error: null };
    } catch (unexpectedError) {
      const errorMsg = "An unexpected error occurred during sign out";
      console.error(errorMsg, unexpectedError);
      toast({
        title: "Sign out failed",
        description: errorMsg,
        variant: "destructive",
      });
      return { error: errorMsg };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error("Password reset error:", error.message);
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
        return { error: error.message };
      }

      toast({
        title: "Password reset email sent",
        description: "Check your email for the reset link.",
      });

      return { error: null };
    } catch (unexpectedError) {
      const errorMsg = "An unexpected error occurred during password reset";
      console.error(errorMsg, unexpectedError);
      toast({
        title: "Password reset failed",
        description: errorMsg,
        variant: "destructive",
      });
      return { error: errorMsg };
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}
