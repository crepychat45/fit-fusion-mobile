import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

type Status = "processing" | "success" | "error" | "recovery";

/**
 * Handles all auth redirects:
 * - Email verification (signup confirm)
 * - Magic link sign-in
 * - Password recovery (PASSWORD_RECOVERY event → /reset-password)
 * - Provider OAuth callback errors
 *
 * Supabase returns tokens in the URL hash (#access_token=...) or query
 * (?code=... for PKCE). We surface human-readable errors from either.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<Status>("processing");
  const [message, setMessage] = useState("Verifying your email…");

  useEffect(() => {
    let mounted = true;

    const parseHashError = () => {
      const hash = window.location.hash.replace(/^#/, "");
      const params = new URLSearchParams(hash);
      const error = params.get("error") ?? new URLSearchParams(window.location.search).get("error");
      const description =
        params.get("error_description") ??
        new URLSearchParams(window.location.search).get("error_description");
      return { error, description: description?.replace(/\+/g, " ") ?? null };
    };

    const { error, description } = parseHashError();
    if (error) {
      const desc = description ?? "Authentication link is invalid or has expired.";
      if (mounted) {
        setStatus("error");
        setMessage(desc);
      }
      toast({ title: "Authentication error", description: desc, variant: "destructive" });
      return;
    }

    // Listen for auth state to determine flow type
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY") {
        setStatus("recovery");
        setMessage("Redirecting to reset your password…");
        setTimeout(() => navigate("/reset-password", { replace: true }), 400);
      } else if (event === "SIGNED_IN" && session) {
        setStatus("success");
        setMessage("You're signed in! Redirecting…");
        toast({ title: "Email verified", description: "Welcome to FitFusion." });
        setTimeout(() => navigate("/", { replace: true }), 800);
      }
    });

    // If nothing happens after a moment, check session directly
    const fallback = window.setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session) {
        setStatus("success");
        setMessage("You're signed in! Redirecting…");
        setTimeout(() => navigate("/", { replace: true }), 600);
      } else {
        setStatus("error");
        setMessage("This link is invalid or has already been used. Try signing in or request a new link.");
      }
    }, 2500);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.clearTimeout(fallback);
    };
  }, [navigate, toast]);

  const icon =
    status === "processing" ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> :
    status === "success" ? <CheckCircle2 className="h-8 w-8 text-green-500" /> :
    status === "recovery" ? <Mail className="h-8 w-8 text-primary" /> :
    <XCircle className="h-8 w-8 text-destructive" />;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-background/60 backdrop-blur-2xl p-8 text-center shadow-2xl"
      >
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <h1 className="text-xl font-semibold mb-2">
          {status === "processing" && "Verifying…"}
          {status === "success" && "Verified"}
          {status === "recovery" && "Password Reset"}
          {status === "error" && "Verification Failed"}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        {status === "error" && (
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate("/auth", { replace: true })}>Back to Sign In</Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
