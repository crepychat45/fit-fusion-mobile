import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Shield, Fingerprint, Activity, Loader2, Chrome, Apple, Sparkles } from "lucide-react";
import { lovable } from "@/integrations/lovable";
import { getDefaultPasskey, verifyPasskey, listPasskeys, PasskeyError } from "@/lib/passkey-manager";
import { supabase } from "@/integrations/supabase/client";

interface EnhancedAuthFormProps {
  onSuccess?: () => void;
}

export function EnhancedAuthForm({ onSuccess }: EnhancedAuthFormProps) {
  const { toast } = useToast();
  const [loadingProvider, setLoadingProvider] = useState<null | "google" | "apple" | "passkey">(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [passkeyEnrolled, setPasskeyEnrolled] = useState(false);
  const [defaultPasskeyEmail, setDefaultPasskeyEmail] = useState<string | null>(null);

  useEffect(() => {
    const hasWebAuthn =
      typeof window !== "undefined" &&
      !!(window as any).PublicKeyCredential;
    setBiometricAvailable(hasWebAuthn);

    (async () => {
      try {
        const list = await listPasskeys();
        if (list.length > 0) {
          setPasskeyEnrolled(true);
          const def = list.find((p) => p.isDefault) || list[0];
          setDefaultPasskeyEmail(def?.email ?? null);
        }
      } catch {
        /* noop */
      }
    })();
  }, []);

  const handleOAuth = async (provider: "google" | "apple") => {
    setLoadingProvider(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (result.redirected) return; // browser will redirect
      // Tokens set — session established
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: `${provider === "google" ? "Google" : "Apple"} Sign-In Failed`,
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingProvider(null);
    }
  };

  const handlePasskeySignIn = async () => {
    setLoadingProvider("passkey");
    try {
      const def = await getDefaultPasskey();
      if (!def) {
        toast({
          title: "No passkey on this device",
          description: "Sign in with Google or Apple once, then enrol a passkey from Profile → Security.",
          variant: "destructive",
        });
        return;
      }
      const rec = await verifyPasskey(def.id);
      if (!rec) throw new Error("Verification cancelled");

      // Passkey verified locally → complete session via magic link to the enrolled email.
      const { error } = await supabase.auth.signInWithOtp({
        email: rec.email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;

      toast({
        title: "Passkey verified ✓",
        description: `Check ${rec.email} for a one-tap link to complete sign-in.`,
      });
    } catch (e: any) {
      const isPk = e instanceof PasskeyError;
      toast({
        title: isPk ? e.message : "Passkey sign-in failed",
        description: isPk ? e.suggestion : e?.message || "Try Google or Apple sign-in instead.",
        variant: "destructive",
      });
    } finally {
      setLoadingProvider(null);
    }
  };

  const busy = loadingProvider !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto px-4"
    >
      <Card className="bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
            className="mx-auto w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center"
          >
            <Activity className="h-7 w-7 md:h-8 md:w-8 text-primary-foreground" />
          </motion.div>

          <div>
            <CardTitle className="text-xl md:text-2xl font-bold text-foreground">
              Welcome to FitFusion
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Sign in securely — no passwords, no friction.
            </p>
          </div>

          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs bg-secondary/50">
              <Shield className="h-3 w-3 mr-1" />
              End-to-End Encrypted
            </Badge>
            {biometricAvailable && (
              <Badge variant="outline" className="text-xs bg-secondary/50">
                <Fingerprint className="h-3 w-3 mr-1" />
                Biometric Ready
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-4 md:px-6 pb-6">
          {/* Passkey / Biometric — primary when enrolled */}
          {biometricAvailable && passkeyEnrolled && (
            <Button
              type="button"
              onClick={handlePasskeySignIn}
              disabled={busy}
              className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold"
            >
              {loadingProvider === "passkey" ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Fingerprint className="mr-2 h-5 w-5" />
              )}
              Continue with Passkey
              {defaultPasskeyEmail && (
                <span className="ml-2 text-xs opacity-80 truncate max-w-[140px]">
                  · {defaultPasskeyEmail}
                </span>
              )}
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuth("google")}
            disabled={busy}
            className="w-full h-12"
          >
            {loadingProvider === "google" ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Chrome className="mr-2 h-5 w-5" />
            )}
            Continue with Google
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuth("apple")}
            disabled={busy}
            className="w-full h-12"
          >
            {loadingProvider === "apple" ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Apple className="mr-2 h-5 w-5" />
            )}
            Continue with Apple
          </Button>

          {biometricAvailable && !passkeyEnrolled && (
            <div className="mt-2 p-3 rounded-xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>
                After your first sign-in, enrol a passkey in{" "}
                <span className="font-medium text-foreground">Profile → Security</span> to
                unlock one-tap biometric login on this device.
              </span>
            </div>
          )}

          <p className="text-[11px] text-center text-muted-foreground pt-2">
            By continuing, you agree to our Terms & Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
