import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Fingerprint,
  Smartphone,
  Activity,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";
import { SocialLogin } from "./social-login";
import {
  getDefaultPasskey,
  verifyPasskey,
  listPasskeys,
  PasskeyError,
  getPasskeySession,
  attachSessionToPasskey,
  clearPasskeySession,
} from "@/lib/passkey-manager";
import { supabase } from "@/integrations/supabase/client";

interface EnhancedAuthFormProps {
  onSuccess?: () => void;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
  label: string;
}

export function EnhancedAuthForm({ onSuccess }: EnhancedAuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { loading, signIn, signUp, resetPassword, resendVerification, signInWithMagicLink } = useEnhancedAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  const [formValid, setFormValid] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [passkeyEnrolled, setPasskeyEnrolled] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [capsLock, setCapsLock] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);


  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = window.setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [resendCooldown]);


  useEffect(() => {
    const hasWebAuthn = typeof window !== "undefined" && !!(window as any).PublicKeyCredential;
    setBiometricAvailable(hasWebAuthn);
    (async () => {
      try {
        const list = await listPasskeys();
        if (list.length > 0) {
          setPasskeyEnrolled(true);
          const def = list.find((p) => p.isDefault) || list[0];
          if (def?.email && !email) setEmail(def.email);
        }
      } catch { /* noop */ }
    })();
  }, []);

  const handlePasskeySignIn = async () => {
    setPasskeyLoading(true);
    try {
      const def = await getDefaultPasskey();
      if (!def) {
        toast({
          title: "No passkey on this device",
          description: "Sign in once, then enrol a passkey from Profile → Security.",
          variant: "destructive",
        });
        return;
      }
      const rec = await verifyPasskey(def.id);
      if (!rec) throw new Error("Verification cancelled");

      // Preferred path: restore the session tokens stashed at enrollment.
      const stored = await getPasskeySession(rec.id);
      if (stored?.refresh_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token: stored.access_token,
          refresh_token: stored.refresh_token,
        });
        if (!error && data.session) {
          // Refresh tokens rotate on use — persist the new pair.
          await attachSessionToPasskey(rec.id, {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
          toast({
            title: "Signed in with passkey ✓",
            description: `Welcome back, ${rec.email}`,
          });
          if (onSuccess) onSuccess();
          return;
        }
        // Refresh token expired or revoked → clear and fall through to magic link.
        await clearPasskeySession(rec.id);
      }

      // Fallback: no stored session (older enrollment) or refresh failed.
      const { error } = await signInWithMagicLink(rec.email);
      if (error) throw new Error(error);
      toast({
        title: "Passkey verified ✓",
        description: `Check ${rec.email} for a one-tap sign-in link to finish.`,
      });
    } catch (e: any) {
      const isPk = e instanceof PasskeyError;
      toast({
        title: isPk ? e.message : "Passkey sign-in failed",
        description: isPk
          ? e.suggestion
          : e?.message || "Try email magic link or password instead.",
        variant: "destructive",
      });
    } finally {
      setPasskeyLoading(false);
    }
  };


  useEffect(() => {
    validateEmail(email);
  }, [email]);

  useEffect(() => {
    if (password) {
      setPasswordStrength(checkPasswordStrength(password));
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  useEffect(() => {
    let isValid = false;
    if (isSignUp) {
      isValid = !!(emailValid && password.length >= 6 && (passwordStrength?.score ?? 0) >= 3 && password === confirmPassword && acceptTerms && name.length >= 2);
    } else {
      isValid = !!(emailValid && password.length >= 1);
    }
    setFormValid(isValid);
  }, [emailValid, passwordStrength, password, confirmPassword, acceptTerms, name, isSignUp]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    setEmailValid(email.length > 0 ? isValid : null);
    return isValid;
  };

  const checkPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score++;
    else feedback.push("At least 8 characters");

    if (/[a-z]/.test(password)) score++;
    else feedback.push("Include lowercase letters");

    if (/[A-Z]/.test(password)) score++;
    else feedback.push("Include uppercase letters");

    if (/\d/.test(password)) score++;
    else feedback.push("Include numbers");

    if (/[^a-zA-Z\d]/.test(password)) score++;
    else feedback.push("Include special characters");

    const strengthMap: Record<number, { color: string; label: string }> = {
      0: { color: "text-destructive", label: "Very Weak" },
      1: { color: "text-destructive", label: "Weak" },
      2: { color: "text-yellow-500", label: "Fair" },
      3: { color: "text-primary", label: "Good" },
      4: { color: "text-green-500", label: "Strong" },
      5: { color: "text-green-600", label: "Very Strong" },
    };

    return { score, feedback, ...strengthMap[score as keyof typeof strengthMap] };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) {
      toast({ title: "Form Invalid", description: "Please check all fields.", variant: "destructive" });
      return;
    }

    try {
      if (isSignUp) {
        const { error, needsVerification } = await signUp(email, password);
        if (error) throw new Error(error);
        if (needsVerification) {
          setPendingVerificationEmail(email);
          setResendCooldown(30);
          return;
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) throw new Error(error);
      }
      if (onSuccess) onSuccess();
    } catch (error: any) {
      const msg = String(error?.message ?? "");
      if (/confirm|verif/i.test(msg) && !isSignUp) {
        setPendingVerificationEmail(email);
      }
      toast({ title: isSignUp ? "Sign Up Failed" : "Sign In Failed", description: msg, variant: "destructive" });
    }
  };

  const handleResend = async () => {
    if (!pendingVerificationEmail || resendCooldown > 0) return;
    const { error } = await resendVerification(pendingVerificationEmail);
    if (!error) setResendCooldown(45);
  };

  const handleMagicLink = async () => {
    if (!emailValid) {
      toast({ title: "Enter your email", description: "We'll send a magic sign-in link.", variant: "destructive" });
      return;
    }
    await signInWithMagicLink(email);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !validateEmail(resetEmail)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email.", variant: "destructive" });
      return;
    }

    try {
      const { error } = await resetPassword(resetEmail);
      if (error) throw new Error(error);
      toast({ title: "Reset Email Sent", description: "Check your email for the reset link." });
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      toast({ title: "Reset Failed", description: error.message, variant: "destructive" });
    }
  };

  if (pendingVerificationEmail) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto px-4">
        <Card className="bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
              className="mx-auto w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center">
              <Mail className="h-7 w-7 md:h-8 md:w-8 text-primary-foreground" />
            </motion.div>
            <div>
              <CardTitle className="text-xl md:text-2xl font-bold text-foreground">Verify your email</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                We sent a verification link to <span className="font-medium text-foreground">{pendingVerificationEmail}</span>. Click it to activate your account — no code needed.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 px-4 md:px-6">
            <Button type="button" className="w-full h-12" onClick={handleResend} disabled={loading || resendCooldown > 0}>
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend verification email"}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => { setPendingVerificationEmail(null); setIsSignUp(false); }}>
              Back to Sign In
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Didn't get it? Check spam, or try a different email address.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (showForgotPassword) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto px-4">
        <Card className="bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
              className="mx-auto w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center">
              <Lock className="h-7 w-7 md:h-8 md:w-8 text-primary-foreground" />
            </motion.div>
            <div>
              <CardTitle className="text-xl md:text-2xl font-bold text-foreground">Reset Password</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">Enter your email to receive a reset link</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-4 md:px-6">
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail" className="text-sm">Email Address</Label>
                <div className="relative">
                  <Input id="resetEmail" type="email" placeholder="Enter your email" value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)} className="pl-10 h-12" />
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? <div className="h-5 w-5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" /> : "Send Reset Link"}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgotPassword(false)}>
                Back to Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto px-4">
      <Card className="bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
            className="mx-auto w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center">
            <Activity className="h-7 w-7 md:h-8 md:w-8 text-primary-foreground" />
          </motion.div>

          <div>
            <CardTitle className="text-xl md:text-2xl font-bold text-foreground">
              {isSignUp ? "Join FitFusion" : "Welcome Back"}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {isSignUp ? "Create your secure account" : "Sign in to continue"}
            </p>
          </div>

          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs bg-secondary/50">
              <Shield className="h-3 w-3 mr-1" />
              256-bit Encryption
            </Badge>
            {biometricAvailable && (
              <Badge variant="outline" className="text-xs bg-secondary/50">
                <Fingerprint className="h-3 w-3 mr-1" />
                Biometric Ready
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-5 px-4 md:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {isSignUp && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                  <Label htmlFor="name" className="text-sm">Full Name</Label>
                  <div className="relative">
                    <Input id="name" type="text" placeholder="Enter your full name" value={name}
                      onChange={(e) => setName(e.target.value)} className="pl-10 h-12" />
                    <UserPlus className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email Address</Label>
              <div className="relative">
                <Input id="email" type="email" placeholder="Enter your email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 pr-10 h-12 ${emailValid === true ? "border-green-500" : emailValid === false ? "border-red-500" : ""}`} />
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                {emailValid !== null && (
                  <div className="absolute right-3 top-3.5">
                    {emailValid ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={(e) => setCapsLock(e.getModifierState && e.getModifierState("CapsLock"))}
                  onKeyDown={(e) => setCapsLock(e.getModifierState && e.getModifierState("CapsLock"))}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  className="pl-10 pr-10 h-12" />
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {capsLock && (
                <p className="text-xs text-yellow-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Caps Lock is on
                </p>
              )}


              <AnimatePresence>
                {passwordStrength && isSignUp && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Password Strength</span>
                      <span className={`text-xs font-medium ${passwordStrength.color}`}>{passwordStrength.label}</span>
                    </div>
                    <Progress value={(passwordStrength.score / 5) * 100} className="h-1.5" />
                    {passwordStrength.feedback.length > 0 && (
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        {passwordStrength.feedback.map((item, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />{item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {isSignUp && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                    <div className="relative">
                      <Input id="confirmPassword" type="password" placeholder="Confirm your password"
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`pl-10 pr-10 h-12 ${confirmPassword && password === confirmPassword ? "border-green-500" : confirmPassword && password !== confirmPassword ? "border-red-500" : ""}`} />
                      <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                      {confirmPassword && (
                        <div className="absolute right-3 top-3.5">
                          {password === confirmPassword ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(checked) => setAcceptTerms(checked as boolean)} className="mt-1" />
                    <Label htmlFor="terms" className="text-xs leading-relaxed">
                      I agree to the <a href="/terms-of-service" className="text-primary hover:underline">Terms of Service</a> and{" "}
                      <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>
                    </Label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 font-medium" disabled={loading || !formValid}>
              {loading ? (
                <div className="h-5 w-5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              ) : isSignUp ? (
                <>Create Account<ArrowRight className="ml-2 h-4 w-4" /></>
              ) : (
                <>Sign In<LogIn className="ml-2 h-4 w-4" /></>
              )}
            </Button>

            {!isSignUp && (
              <Button type="button" variant="link" className="w-full text-sm" onClick={() => setShowForgotPassword(true)}>
                Forgot your password?
              </Button>
            )}
          </form>


          <SocialLogin />

          {biometricAvailable && !isSignUp && (
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-primary/40 hover:border-primary hover:bg-primary/5"
              onClick={handlePasskeySignIn}
              disabled={passkeyLoading || loading}
            >
              {passkeyLoading ? (
                <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin mr-2" />
              ) : (
                <Fingerprint className="h-4 w-4 mr-2 text-primary" />
              )}
              {passkeyEnrolled ? "Sign in with Passkey" : "Set up Passkey after sign-in"}
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full h-11"
            onClick={handleMagicLink}
            disabled={loading || !emailValid}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email me a magic link
          </Button>

          <div className="text-center">
            <Button variant="link" className="text-sm" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
