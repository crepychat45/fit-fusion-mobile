
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  Zap,
  Star
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useEnhancedAuth } from "@/hooks/use-enhanced-auth";

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
  const { loading, signIn, signUp, resetPassword } = useEnhancedAuth();
  const { toast } = useToast();
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Validation states
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  const [formValid, setFormValid] = useState(false);

  // Advanced features
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    // Check for biometric availability
    if ('credentials' in navigator && 'create' in navigator.credentials) {
      setBiometricAvailable(true);
    }
  }, []);

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
    const isValid = emailValid && 
                   (!isSignUp || (passwordStrength?.score >= 3 && password === confirmPassword && acceptTerms && name.length >= 2));
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

    const strengthMap = {
      0: { color: "text-red-500", label: "Very Weak" },
      1: { color: "text-red-500", label: "Weak" },
      2: { color: "text-yellow-500", label: "Fair" },
      3: { color: "text-blue-500", label: "Good" },
      4: { color: "text-green-500", label: "Strong" },
      5: { color: "text-green-600", label: "Very Strong" }
    };

    return {
      score,
      feedback,
      ...strengthMap[score as keyof typeof strengthMap]
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formValid) {
      toast({
        title: "Form Invalid",
        description: "Please check all fields and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) throw new Error(error);
      } else {
        const { error } = await signIn(email, password);
        if (error) throw new Error(error);
      }
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: isSignUp ? "Sign Up Failed" : "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBiometricAuth = async () => {
    try {
      // Placeholder for biometric authentication
      toast({
        title: "Biometric Auth",
        description: "Feature coming soon!",
      });
    } catch (error) {
      toast({
        title: "Biometric Failed",
        description: "Please try again or use password.",
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail || !validateEmail(resetEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await resetPassword(resetEmail);
      if (error) throw new Error(error);
      
      toast({
        title: "Reset Email Sent",
        description: "Check your email for the password reset link.",
      });
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
          >
            <Shield className="h-8 w-8 text-white" />
          </motion.div>
          
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isSignUp ? "Join FitFusion" : "Welcome Back"}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {isSignUp ? "Create your account with advanced security" : "Sign in to your secure account"}
            </p>
          </div>

          {/* Security Features Badge */}
          <div className="flex justify-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              256-bit Encryption
            </Badge>
            {biometricAvailable && (
              <Badge variant="outline" className="text-xs">
                <Fingerprint className="h-3 w-3 mr-1" />
                Biometric Ready
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Advanced
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="email">
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                      />
                      <UserPlus className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                  </motion.div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-10 pr-10 ${
                        emailValid === true ? 'border-green-500' : 
                        emailValid === false ? 'border-red-500' : ''
                      }`}
                    />
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    {emailValid !== null && (
                      <div className="absolute right-3 top-2.5">
                        {emailValid ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  <AnimatePresence>
                    {passwordStrength && isSignUp && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Password Strength</span>
                          <span className={`text-sm font-medium ${passwordStrength.color}`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <Progress 
                          value={(passwordStrength.score / 5) * 100} 
                          className="h-2"
                        />
                        {passwordStrength.feedback.length > 0 && (
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {passwordStrength.feedback.map((item, index) => (
                              <li key={index} className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`pl-10 pr-10 ${
                            confirmPassword && password === confirmPassword ? 'border-green-500' :
                            confirmPassword && password !== confirmPassword ? 'border-red-500' : ''
                          }`}
                        />
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        {confirmPassword && (
                          <div className="absolute right-3 top-2.5">
                            {password === confirmPassword ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="terms" 
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                      />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the <a href="/terms-of-service" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a>
                      </Label>
                    </div>
                  </motion.div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={loading || !formValid}
                >
                  {loading ? (
                    <div className="h-5 w-5 rounded-full border-2 border-background border-t-transparent animate-spin" />
                  ) : isSignUp ? (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Sign In
                      <LogIn className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                {!isSignUp && (
                  <Button 
                    type="button"
                    variant="link" 
                    className="text-sm mt-2"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot your password?
                  </Button>
                )}
              </form>

              {/* Password Reset Modal */}
              <AnimatePresence>
                {showForgotPassword && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="bg-white rounded-lg p-6 w-full max-w-md"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
                      <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div>
                          <Label htmlFor="resetEmail">Email Address</Label>
                          <Input
                            id="resetEmail"
                            type="email"
                            placeholder="Enter your email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" className="flex-1" disabled={loading}>
                            {loading ? "Sending..." : "Send Reset Link"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setShowForgotPassword(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div className="text-center space-y-4">
                <h3 className="font-semibold">Advanced Authentication</h3>
                
                {biometricAvailable && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleBiometricAuth}
                  >
                    <Fingerprint className="mr-2 h-4 w-4" />
                    Use Biometric Authentication
                  </Button>
                )}
                
                <Button variant="outline" className="w-full">
                  <Smartphone className="mr-2 h-4 w-4" />
                  SMS Two-Factor Authentication
                </Button>
                
                <div className="text-xs text-muted-foreground">
                  Advanced features require account setup
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button 
            variant="link" 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm"
            disabled={loading}
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </Button>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            Secured with end-to-end encryption
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
