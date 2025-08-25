import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  Shield,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Label } from "@/components/ui/label";

interface EnhancedChatAuthProps {
  onAuthSuccess: () => void;
  onAuthError: (error: string) => void;
}

export function EnhancedChatAuth({
  onAuthSuccess,
  onAuthError,
}: EnhancedChatAuthProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [authStep, setAuthStep] = useState<"form" | "verification" | "success">(
    "form",
  );
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          setAuthStep("success");
          onAuthSuccess();
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };

    checkAuth();
  }, [onAuthSuccess]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!isLogin && password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          setAuthStep("success");
          toast({
            title: "Login Successful",
            description: "Welcome back to FitFusion Chat!",
          });
          onAuthSuccess();
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/chat`,
          },
        });

        if (error) throw error;

        if (data.user) {
          if (data.user.email_confirmed_at) {
            setAuthStep("success");
            onAuthSuccess();
          } else {
            setAuthStep("verification");
            toast({
              title: "Check Your Email",
              description:
                "We've sent you a verification link to complete your registration.",
            });
          }
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);

      let errorMessage = "An unexpected error occurred";

      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.message?.includes("User already registered")) {
        errorMessage =
          "This email is already registered. Please try logging in instead.";
        setIsLogin(true);
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage =
          "Please check your email and click the verification link.";
        setAuthStep("verification");
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ general: errorMessage });
      onAuthError(errorMessage);

      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) throw error;

      toast({
        title: "Verification Email Sent",
        description: "Please check your email for the verification link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email",
        variant: "destructive",
      });
    }
  };

  if (authStep === "verification") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please check your email and click the verification link to
              complete your registration.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-2">
            <Button
              onClick={resendVerification}
              variant="outline"
              className="w-full"
            >
              Resend Verification Email
            </Button>
            <Button
              onClick={() => setAuthStep("form")}
              variant="ghost"
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (authStep === "success") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Welcome to FitFusion Chat</CardTitle>
          <CardDescription>
            You're successfully authenticated and ready to start chatting!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>{isLogin ? "Sign In" : "Create Account"}</CardTitle>
        <CardDescription>
          {isLogin
            ? "Welcome back! Please sign in to continue."
            : "Join FitFusion Chat to connect with fitness enthusiasts"}
        </CardDescription>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            <Shield className="h-3 w-3 mr-1" />
            Secure Authentication
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {errors.general && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? "border-destructive" : ""}
              disabled={isLoading}
              required
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={
                  isLogin
                    ? "Enter your password"
                    : "Create a password (min 6 characters)"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={
                  errors.password ? "border-destructive pr-10" : "pr-10"
                }
                disabled={isLoading}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isLogin ? "Signing In..." : "Creating Account..."}
              </>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                setEmail("");
                setPassword("");
              }}
              disabled={isLoading}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
