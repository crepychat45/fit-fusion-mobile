import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Shield,
  Fingerprint,
  Activity,
  Loader2,
  Chrome,
  Apple,
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { lovable } from "@/integrations/lovable";
import {
  getDefaultPasskey,
  verifyPasskey,
  listPasskeys,
  probePasskeySupport,
  PasskeyError,
} from "@/lib/passkey-manager";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EnhancedAuthFormProps {
  onSuccess?: () => void;
}

type ProviderLoading =
  | null
  | "google"
  | "apple"
  | "passkey"
  | "signin"
  | "signup"
  | "reset"
  | "magic";

export function EnhancedAuthForm({ onSuccess }: EnhancedAuthFormProps) {
  const { toast } = useToast();
  const { signIn, signUp, resetPassword, signInWithMagicLink } = useEnhancedAuth();

  const [loadingProvider, setLoadingProvider] = useState<ProviderLoading>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [passkeyEnrolled, setPasskeyEnrolled] = useState(false);
  const [defaultPasskeyEmail, setDefaultPasskeyEmail] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  useEffect(() => {
    const hasWebAuthn =
      typeof window !== "undefined" && !!(window as any).PublicKeyCredential;
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

  const busy = loadingProvider !== null;

  const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const handleOAuth = async (provider: "google" | "apple") => {
    setLoadingProvider(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
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
          description:
            "Sign in with email or Google once, then enrol a passkey from Profile → Security.",
          variant: "destructive",
        });
        return;
      }
      const rec = await verifyPasskey(def.id);
      if (!rec) throw new Error("Verification cancelled");

      const { error } = await signInWithMagicLink(rec.email);
      if (error) throw new Error(error);

      toast({
        title: "Passkey verified ✓",
        description: `Check ${rec.email} for a one-tap link to complete sign-in.`,
      });
    } catch (e: any) {
      const isPk = e instanceof PasskeyError;
      toast({
        title: isPk ? e.message : "Passkey sign-in failed",
        description: isPk
          ? e.suggestion
          : e?.message || "Try email or Google sign-in instead.",
        variant: "destructive",
      });
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validEmail(email)) {
      toast({ title: "Invalid email", description: "Enter a valid email address.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoadingProvider("signin");
    const { error } = await signIn(email.trim(), password);
    setLoadingProvider(null);
    if (!error && onSuccess) onSuccess();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validEmail(email)) {
      toast({ title: "Invalid email", description: "Enter a valid email address.", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Weak password", description: "Use at least 8 characters for a new account.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", description: "Please confirm your password.", variant: "destructive" });
      return;
    }
    setLoadingProvider("signup");
    const { error, needsVerification } = await signUp(email.trim(), password);
    setLoadingProvider(null);
    if (!error && !needsVerification && onSuccess) onSuccess();
    if (!error && needsVerification) {
      setMode("signin");
    }
  };

  const handleReset = async () => {
    if (!validEmail(email)) {
      toast({
        title: "Enter your email",
        description: "Type your email above, then tap Forgot password.",
        variant: "destructive",
      });
      return;
    }
    setLoadingProvider("reset");
    await resetPassword(email.trim());
    setLoadingProvider(null);
  };

  const handleMagic = async () => {
    if (!validEmail(email)) {
      toast({
        title: "Enter your email",
        description: "Type your email above to receive a magic sign-in link.",
        variant: "destructive",
      });
      return;
    }
    setLoadingProvider("magic");
    await signInWithMagicLink(email.trim());
    setLoadingProvider(null);
  };

  const detectCaps = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(e.getModifierState && e.getModifierState("CapsLock"));
  };

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
              Sign in with email, Google, Apple, or a passkey.
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
          {/* Passkey — primary when enrolled */}
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

          {/* Email / Password tabs */}
          <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-4">
              <form onSubmit={handleSignIn} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      autoComplete="email"
                      className="pl-9 h-11"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={busy}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className="pl-9 pr-10 h-11"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyUp={detectCaps}
                      disabled={busy}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {capsLock && (
                    <p className="text-[11px] text-amber-500 flex items-center gap-1">
                      <Shield className="h-3 w-3" /> Caps Lock is on
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={busy}
                    className="text-primary hover:underline disabled:opacity-50"
                  >
                    Forgot password?
                  </button>
                  <button
                    type="button"
                    onClick={handleMagic}
                    disabled={busy}
                    className="text-primary hover:underline disabled:opacity-50 flex items-center gap-1"
                  >
                    <KeyRound className="h-3 w-3" /> Magic link
                  </button>
                </div>
                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full h-11 font-semibold"
                >
                  {loadingProvider === "signin" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      autoComplete="email"
                      className="pl-9 h-11"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={busy}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="pl-9 pr-10 h-11"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyUp={detectCaps}
                      disabled={busy}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-confirm">Confirm password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-confirm"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="pl-9 h-11"
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={busy}
                      required
                      minLength={8}
                    />
                  </div>
                  {confirmPassword.length > 0 && confirmPassword !== password && (
                    <p className="text-[11px] text-destructive">Passwords do not match</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full h-11 font-semibold"
                >
                  {loadingProvider === "signup" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* OAuth divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
              <span className="bg-background/95 px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuth("google")}
              disabled={busy}
              className="h-11"
            >
              {loadingProvider === "google" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Chrome className="mr-2 h-4 w-4" />
              )}
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuth("apple")}
              disabled={busy}
              className="h-11"
            >
              {loadingProvider === "apple" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Apple className="mr-2 h-4 w-4" />
              )}
              Apple
            </Button>
          </div>

          {biometricAvailable && !passkeyEnrolled && (
            <div className="mt-2 p-3 rounded-xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>
                After your first sign-in, enrol a passkey in{" "}
                <span className="font-medium text-foreground">Profile → Security</span>{" "}
                to unlock one-tap biometric login on this device.
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
