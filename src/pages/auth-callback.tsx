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
    let settled = false;

    const search = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

    const get = (k: string) => hashParams.get(k) ?? search.get(k);

    const finish = (session: unknown, type?: string | null) => {
      if (!mounted || settled) return;
      settled = true;
      if (type === "recovery") {
        setStatus("recovery");
        setMessage("Redirecting to reset your password…");
        setTimeout(() => navigate("/reset-password", { replace: true }), 400);
        return;
      }
      if (session) {
        setStatus("success");
        setMessage("You're signed in! Redirecting…");
        toast({ title: "Signed in", description: "Welcome back to FitXFusion." });
        setTimeout(() => navigate("/", { replace: true }), 700);
      }
    };

    const fail = (desc: string) => {
      if (!mounted || settled) return;
      settled = true;
      setStatus("error");
      setMessage(desc);
      toast({ title: "Authentication error", description: desc, variant: "destructive" });
    };

    const run = async () => {
      const errParam = get("error") || get("error_code");
      if (errParam) {
        const d = (get("error_description") || "This link is invalid or has expired.").replace(/\+/g, " ");
        fail(d);
        return;
      }

      const type = get("type");

      try {
        // 1) Already signed in by detectSessionInUrl (hash tokens).
        const { data: pre } = await supabase.auth.getSession();
        if (pre.session) return finish(pre.session, type);

        // 2) Hash tokens present but not yet applied.
        const access_token = hashParams.get("access_token");
        const refresh_token = hashParams.get("refresh_token");
        if (access_token && refresh_token) {
          const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) return fail(error.message);
          return finish(data.session, type);
        }

        // 3) Email OTP link (token_hash) — works across browsers/devices.
        const token_hash = get("token_hash") || get("token");
        if (token_hash) {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: (type as any) || "magiclink",
          });
          if (error) return fail(error.message);
          return finish(data.session, type);
        }

        // 4) PKCE authorization code.
        const code = get("code");
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            return fail(
              /verifier/i.test(error.message)
                ? "Open the link in the same browser where you requested it, or use the 6-digit code instead."
                : error.message,
            );
          }
          return finish(data.session, type);
        }

        fail("This link is invalid or has already been used. Request a new one.");
      } catch (e: any) {
        fail(e?.message || "Could not complete sign-in.");
      }
    };

    // Late auth events (e.g. recovery detected by the SDK).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY") {
        settled = false;
        finish(session, "recovery");
      } else if (event === "SIGNED_IN" && session) {
        finish(session, get("type"));
      }
    });

    void run();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);


  const icon =
    status === "processing" ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> :
    status === "success" ? <CheckCircle2 className="h-8 w-8 text-green-500" /> :
    status === "recovery" ? <Mail className="h-8 w-8 text-primary" /> :
    <XCircle className="h-8 w-8 text-destructive" />;

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-background">
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
