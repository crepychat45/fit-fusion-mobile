import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Key,
  Lock,
  LogOut,
  Smartphone,
  Laptop,
  Monitor,
  Camera,
  Bell,
  Shield,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  RefreshCcw,
  AlertTriangle,
  CheckCircle2,
  Palette,
  LogIn,
  UserPlus,
} from "lucide-react";

// ---------- helpers ----------
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const PREFS_KEY = "fitfusion:account-preferences:v1";

type Preferences = {
  emailNotifications: boolean;
  privateAccount: boolean;
  reducedMotion: boolean;
  compactMode: boolean;
};

const defaultPrefs: Preferences = {
  emailNotifications: true,
  privateAccount: false,
  reducedMotion: false,
  compactMode: false,
};

function loadPrefs(): Preferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return defaultPrefs;
    return { ...defaultPrefs, ...JSON.parse(raw) };
  } catch {
    return defaultPrefs;
  }
}

function parseUserAgent(ua: string) {
  const os =
    /Windows NT/i.test(ua) ? "Windows"
    : /Mac OS X/i.test(ua) ? "macOS"
    : /Android/i.test(ua) ? "Android"
    : /iPhone|iPad|iPod/i.test(ua) ? "iOS"
    : /Linux/i.test(ua) ? "Linux"
    : "Unknown OS";
  const browser =
    /Edg\//i.test(ua) ? "Edge"
    : /Chrome\//i.test(ua) ? "Chrome"
    : /Firefox\//i.test(ua) ? "Firefox"
    : /Safari\//i.test(ua) ? "Safari"
    : "Browser";
  const isMobile = /Mobi|Android|iPhone/i.test(ua);
  return { os, browser, isMobile };
}

// ---------- component ----------
export function AccountSettings() {
  const { toast } = useToast();

  // auth state
  const [session, setSession] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // profile
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // form state
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // dialogs
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // preferences (state-driven persistence — no interval)
  const [prefs, setPrefs] = useState<Preferences>(() => loadPrefs());
  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }, [prefs]);

  // device info
  const device = useMemo(() => parseUserAgent(navigator.userAgent), []);
  const [locale] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "Unknown";
    }
  });

  // hydrate auth
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const s = data.session;
      setSession(s);
      if (s?.user) {
        setEmail(s.user.email || "");
        setName(s.user.user_metadata?.name || s.user.user_metadata?.full_name || "");
        setAvatarUrl(s.user.user_metadata?.avatar_url || null);
      }
      setCheckingAuth(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      if (s?.user) {
        setEmail(s.user.email || "");
        setName(s.user.user_metadata?.name || s.user.user_metadata?.full_name || "");
        setAvatarUrl(s.user.user_metadata?.avatar_url || null);
      } else {
        setEmail("");
        setName("");
        setAvatarUrl(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isAuthenticated = !!session;

  // ---------- auth handlers ----------
  const handleSignIn = async () => {
    if (!isValidEmail(signInEmail)) {
      toast({ title: "Invalid email", description: "Enter a valid email address.", variant: "destructive" });
      return;
    }
    if (signInPassword.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInEmail.trim(),
        password: signInPassword,
      });
      if (error) throw error;
      toast({ title: "Welcome back", description: "You are signed in." });
      setSignInPassword("");
    } catch (e: any) {
      toast({ title: "Sign in failed", description: e.message || "Check your credentials.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!signUpName.trim()) {
      toast({ title: "Name required", description: "Please enter your full name.", variant: "destructive" });
      return;
    }
    if (!isValidEmail(signUpEmail)) {
      toast({ title: "Invalid email", description: "Enter a valid email address.", variant: "destructive" });
      return;
    }
    if (signUpPassword.length < 8) {
      toast({ title: "Weak password", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: signUpEmail.trim(),
        password: signUpPassword,
        options: {
          data: { name: signUpName.trim() },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      toast({
        title: "Account created",
        description: "Check your inbox to verify your email.",
      });
      setSignUpPassword("");
    } catch (e: any) {
      toast({ title: "Sign up failed", description: e.message || "Try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!isValidEmail(signInEmail)) {
      toast({ title: "Email needed", description: "Enter your email above first.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(signInEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: "Reset link sent", description: "Check your email to reset your password." });
    } catch (e: any) {
      toast({ title: "Could not send link", description: e.message, variant: "destructive" });
    }
  };

  const handleGlobalLogout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) throw error;
      toast({ title: "Signed out everywhere", description: "All sessions revoked." });
      setLogoutDialogOpen(false);
    } catch (e: any) {
      toast({ title: "Sign out failed", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameSave = async () => {
    if (!newName.trim()) {
      toast({ title: "Invalid name", description: "Name cannot be empty.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { name: newName.trim() } });
      if (error) throw error;
      setName(newName.trim());
      toast({ title: "Name updated" });
      setNameDialogOpen(false);
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSave = async () => {
    if (!isValidEmail(newEmail) || newEmail === email) {
      toast({ title: "Invalid email", description: "Enter a different, valid email.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;
      toast({ title: "Verification sent", description: "Confirm the change from your new inbox." });
      setEmailDialogOpen(false);
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    if (newPassword.length < 8) {
      toast({ title: "Weak password", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Mismatch", description: "Passwords don't match.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      // reauth
      const { error: reErr } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (reErr) throw new Error("Current password is incorrect");

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password updated" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordDialogOpen(false);
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- avatar upload ----------
  const handleAvatarPick = () => fileRef.current?.click();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !session?.user?.id) return;

    if (!/^image\/(png|jpeg|jpg|webp|gif)$/.test(file.type)) {
      toast({ title: "Unsupported file", description: "Use PNG, JPG, WebP, or GIF.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB.", variant: "destructive" });
      return;
    }

    setUploadingAvatar(true);
    try {
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      // Storage RLS requires the FIRST folder in the object path to equal auth.uid().
      const path = `${session.user.id}/avatars/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("fitusion.data")
        .upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("fitusion.data").getPublicUrl(path);
      const url = pub.publicUrl;

      const { error: metaErr } = await supabase.auth.updateUser({ data: { avatar_url: url } });
      if (metaErr) throw metaErr;

      setAvatarUrl(url);
      toast({ title: "Photo updated" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ---------- data export (GDPR) ----------
  const handleExportData = useCallback(() => {
    try {
      const localData: Record<string, unknown> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        if (k.startsWith("supabase.auth") || k === "auth_token") continue;
        try {
          const raw = localStorage.getItem(k);
          localData[k] = raw ? (raw.startsWith("{") || raw.startsWith("[") ? JSON.parse(raw) : raw) : null;
        } catch {
          localData[k] = localStorage.getItem(k);
        }
      }
      const payload = {
        exportedAt: new Date().toISOString(),
        version: 1,
        profile: {
          id: session?.user?.id ?? null,
          email,
          name,
          avatarUrl,
          createdAt: session?.user?.created_at ?? null,
        },
        preferences: prefs,
        device: { ...device, timezone: locale, userAgent: navigator.userAgent },
        localStorage: localData,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fitfusion-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: "Export ready", description: "Your data has been downloaded." });
    } catch (e: any) {
      toast({ title: "Export failed", description: e.message, variant: "destructive" });
    }
  }, [session, email, name, avatarUrl, prefs, device, locale, toast]);

  // ---------- account deletion ----------
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      toast({ title: "Confirmation needed", description: 'Type DELETE to confirm.', variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      // Try Edge Function first (recommended), fall back to a soft delete flag.
      const { error: fnErr } = await supabase.functions.invoke("delete-account", { body: {} });
      if (fnErr) {
        // Soft-delete fallback: mark account then sign out globally
        await supabase.auth.updateUser({ data: { pending_deletion_at: new Date().toISOString() } });
        toast({
          title: "Deletion requested",
          description: "Your account is queued for deletion. Support will finalize it shortly.",
        });
      } else {
        toast({ title: "Account deleted", description: "Your account and data have been removed." });
      }
      await supabase.auth.signOut({ scope: "global" });
      setDeleteDialogOpen(false);
      setDeleteConfirm("");
    } catch (e: any) {
      toast({ title: "Deletion failed", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- render ----------
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <Card className="liquid-glass border-border/30">
          <CardHeader>
            <CardTitle>Welcome to FitFusion</CardTitle>
            <CardDescription>Sign in to sync your workouts, or create a new account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as any)} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6 liquid-glass-subtle">
                <TabsTrigger value="signin" className="gap-2">
                  <LogIn className="h-4 w-4" /> Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="gap-2">
                  <UserPlus className="h-4 w-4" /> Create Account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="si-email">Email</Label>
                  <Input
                    id="si-email"
                    type="email"
                    autoComplete="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="si-pw">Password</Label>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-xs"
                      onClick={handleForgotPassword}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      id="si-pw"
                      type={showPw ? "text" : "password"}
                      autoComplete="current-password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button className="w-full" onClick={handleSignIn} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
                  Sign In
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="su-name">Full Name</Label>
                  <Input
                    id="su-name"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="John Doe"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email">Email</Label>
                  <Input
                    id="su-email"
                    type="email"
                    autoComplete="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-pw">Password</Label>
                  <div className="relative">
                    <Input
                      id="su-pw"
                      type={showPw ? "text" : "password"}
                      autoComplete="new-password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
                </div>
                <Button className="w-full" onClick={handleSignUp} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                  Create Account
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = (name || email || "U")
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Profile & Avatar */}
      <Card className="liquid-glass border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Profile
          </CardTitle>
          <CardDescription>Your account details and photo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-2 ring-primary/30">
                <AvatarImage src={avatarUrl || undefined} alt={name || "Avatar"} />
                <AvatarFallback className="text-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-background/70 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="text-lg font-semibold">{name || "Unnamed User"}</div>
              <div className="text-sm text-muted-foreground truncate">{email}</div>
              <Badge variant="secondary" className="mt-1">Verified Account</Badge>
            </div>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <Button onClick={handleAvatarPick} variant="outline" disabled={uploadingAvatar} className="liquid-glass-btn">
                <Camera className="h-4 w-4 mr-2" />
                {uploadingAvatar ? "Uploading..." : "Upload New Picture"}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 liquid-glass-subtle rounded-xl">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span>Full Name</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{name || "—"}</span>
                <Button variant="ghost" size="sm" onClick={() => { setNewName(name); setNameDialogOpen(true); }}>
                  Edit
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 liquid-glass-subtle rounded-xl">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>Email</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate max-w-[180px]">{email}</span>
                <Button variant="ghost" size="sm" onClick={() => { setNewEmail(email); setEmailDialogOpen(true); }}>
                  Edit
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 liquid-glass-subtle rounded-xl">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                <span>Password</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPasswordDialogOpen(true)}>
                <Lock className="h-4 w-4 mr-1" /> Change
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences & Privacy */}
      <Card className="liquid-glass border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" /> Preferences & Privacy
          </CardTitle>
          <CardDescription>Persistent settings saved to this device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              key: "emailNotifications" as const,
              label: "Email Notifications",
              desc: "Weekly reports and important alerts.",
              icon: Bell,
            },
            {
              key: "privateAccount" as const,
              label: "Private Account",
              desc: "Hide your workouts and activity from other users.",
              icon: Shield,
            },
            {
              key: "reducedMotion" as const,
              label: "Reduced Motion",
              desc: "Minimize animations across the app.",
              icon: RefreshCcw,
            },
            {
              key: "compactMode" as const,
              label: "Compact Mode",
              desc: "Denser layouts with tighter spacing.",
              icon: Monitor,
            },
          ].map(({ key, label, desc, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between p-3 liquid-glass-subtle rounded-xl">
              <div className="flex items-start gap-3">
                <Icon className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
              </div>
              <Switch
                checked={prefs[key]}
                onCheckedChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Device & Location */}
      <Card className="liquid-glass border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {device.isMobile ? <Smartphone className="h-5 w-5 text-primary" /> : <Laptop className="h-5 w-5 text-primary" />}
            Current Session
          </CardTitle>
          <CardDescription>Details about this device and session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3 liquid-glass-subtle rounded-xl">
              <div className="text-xs text-muted-foreground">Device</div>
              <div className="font-medium text-sm flex items-center gap-2">
                {device.isMobile ? <Smartphone className="h-4 w-4" /> : <Laptop className="h-4 w-4" />}
                {device.os} · {device.browser}
              </div>
            </div>
            <div className="p-3 liquid-glass-subtle rounded-xl">
              <div className="text-xs text-muted-foreground">Location (approx)</div>
              <div className="font-medium text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {locale}
              </div>
            </div>
            <div className="p-3 liquid-glass-subtle rounded-xl">
              <div className="text-xs text-muted-foreground">Language</div>
              <div className="font-medium text-sm">{navigator.language}</div>
            </div>
            <div className="p-3 liquid-glass-subtle rounded-xl">
              <div className="text-xs text-muted-foreground">Status</div>
              <div className="font-medium text-sm flex items-center gap-2 text-emerald-500">
                <CheckCircle2 className="h-4 w-4" /> Active
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setLogoutDialogOpen(true)}
            disabled={isLoading}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign out from all devices
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" /> Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions. Please proceed carefully.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl border border-destructive/20 bg-background/40">
            <div>
              <div className="font-medium text-sm">Export Personal Data</div>
              <div className="text-xs text-muted-foreground">Download a JSON copy of your profile, preferences and local data.</div>
            </div>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" /> Export Data
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl border border-destructive/30 bg-destructive/5">
            <div>
              <div className="font-medium text-sm text-destructive">Delete Account</div>
              <div className="text-xs text-muted-foreground">Permanently remove your account and all associated data.</div>
            </div>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ---- Dialogs ---- */}
      <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Name</DialogTitle>
            <DialogDescription>Shown across your profile and community posts.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="new-name">Full Name</Label>
            <Input id="new-name" value={newName} onChange={(e) => setNewName(e.target.value)} disabled={isLoading} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleNameSave} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Email</DialogTitle>
            <DialogDescription>We'll send a confirmation link to the new address.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="new-email">New Email</Label>
            <Input id="new-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} disabled={isLoading} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleEmailSave} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Send verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>You'll need your current password to confirm.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="cur-pw">Current Password</Label>
              <Input id="cur-pw" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pw">New Password</Label>
              <Input id="new-pw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cf-pw">Confirm New Password</Label>
              <Input id="cf-pw" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button onClick={handlePasswordSave} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out everywhere?</DialogTitle>
            <DialogDescription>
              This revokes your session on all devices and browsers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleGlobalLogout} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <LogOut className="h-4 w-4 mr-2" /> Sign out globally
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Delete your account?
            </DialogTitle>
            <DialogDescription>
              This action is permanent. All your workouts, progress and profile data will be removed.
              Type <span className="font-mono font-semibold">DELETE</span> to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE"
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isLoading || deleteConfirm !== "DELETE"}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Trash2 className="h-4 w-4 mr-2" /> Permanently delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AccountSettings;
