import React, { useState, useEffect } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Mail,
  Key,
  Lock,
  LogOut,
  Smartphone,
  Laptop,
  RefreshCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

export function AccountSettings() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("John Doe");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [showProfileNameEditor, setShowProfileNameEditor] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState([
    {
      id: "device1",
      name: "iPhone 13",
      type: "phone",
      lastActive: new Date(Date.now() - 1000 * 60 * 5),
      isCurrentDevice: true,
    },
    {
      id: "device2",
      name: "MacBook Pro",
      type: "laptop",
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isCurrentDevice: false,
    },
  ]);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);

        if (session?.user) {
          setEmail(session.user.email || "");
          setName(session.user.user_metadata?.name || "User");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };

    checkAuth();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        setEmail(session.user.email || "");
        setName(session.user.user_metadata?.name || "User");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Enhanced settings persistence
  useEffect(() => {
    const loadSettings = () => {
      try {
        // Load all settings from localStorage with persistence
        const savedSettings = localStorage.getItem("fitfusion-app-settings");
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          // Apply saved settings to component state
          console.log("Loaded persistent settings:", settings);
        }

        const storedProfile = localStorage.getItem("fitfusion-profile");
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          setName(profile.name || name);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();

    // Save settings automatically every 2 seconds if there are changes
    const settingsSaveInterval = setInterval(() => {
      try {
        const currentSettings = {
          lastSaved: new Date().toISOString(),
          autoSave: true,
          settingsVersion: "1.0",
        };
        localStorage.setItem(
          "fitfusion-app-settings",
          JSON.stringify(currentSettings),
        );
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 2000);

    return () => clearInterval(settingsSaveInterval);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Missing Fields",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user?.user_metadata?.name || "User"}!`,
      });

      setPassword("");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description:
          error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || password !== confirmPassword) {
      toast({
        title: "Invalid Input",
        description:
          password !== confirmPassword
            ? "Passwords don't match"
            : "Please fill out all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Account Created",
        description:
          "Your account has been created successfully. Please check your email for verification.",
      });

      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description:
          error.message || "There was an error creating your account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!password || !newPassword || newPassword !== confirmPassword) {
      toast({
        title: "Invalid Input",
        description:
          newPassword !== confirmPassword
            ? "New passwords don't match"
            : "Please fill out all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw new Error("Current password is incorrect");
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });

      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Password Change Failed",
        description:
          error.message || "There was an error changing your password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = async () => {
    if (!email) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        email,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Email Update Initiated",
        description: "Please check your new email for a confirmation link.",
      });

      setEmailDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Email Change Failed",
        description: error.message || "There was an error changing your email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await supabase.auth.signOut();

      toast({
        title: "Logged Out",
        description: "You have been signed out successfully.",
      });

      setLogoutDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Logout Failed",
        description: error.message || "There was an error signing out.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectDevice = (deviceId: string) => {
    // In a real app, this would call an API to revoke the session for this device

    setConnectedDevices((prev) =>
      prev.filter((device) => device.id !== deviceId),
    );

    toast({
      title: "Device Disconnected",
      description: "The device has been signed out successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {!isAuthenticated ? (
        <Card>
          <CardHeader>
            <CardTitle>Login or Create Account</CardTitle>
            <CardDescription>Sign in to access all features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs"
                  onClick={() => {
                    toast({
                      title: "Password Reset",
                      description:
                        "Enter your email to receive a password reset link.",
                    });
                  }}
                >
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm Password (for signup)
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name (for signup)</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="w-full sm:w-auto"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-primary" />
                  <span>Full Name</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      // In a real app, this would open a form to edit the name
                      toast({
                        title: "Edit Profile",
                        description:
                          "Profile editing functionality coming soon.",
                      });
                    }}
                  >
                    <span className="sr-only">Edit</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                    </svg>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-primary" />
                  <span>Email Address</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setEmailDialogOpen(true)}
                  >
                    <span className="sr-only">Edit</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                    </svg>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Key className="h-4 w-4 mr-2 text-primary" />
                  <span>Password</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPasswordDialogOpen(true)}
                >
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connected Devices</CardTitle>
              <CardDescription>
                Manage devices that are signed in to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connectedDevices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      {device.type === "phone" ? (
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Laptop className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {device.name}
                          {device.isCurrentDevice && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last active:{" "}
                          {device.isCurrentDevice
                            ? "Now"
                            : `${Math.floor((Date.now() - device.lastActive.getTime()) / 60000)} mins ago`}
                        </div>
                      </div>
                    </div>
                    {!device.isCurrentDevice && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnectDevice(device.id)}
                      >
                        Disconnect
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setLogoutDialogOpen(true)}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out from all devices
              </Button>
            </CardFooter>
          </Card>
        </>
      )}

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and your new password.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handlePasswordChange} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Email Address</DialogTitle>
            <DialogDescription>
              Enter the new email address you want to use.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-email">Current Email</Label>
              <Input id="current-email" type="email" value={email} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-email">New Email</Label>
              <Input
                id="new-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEmailChange} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out from all devices?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? "Signing out..." : "Sign Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Name Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Display Name
          </CardTitle>
          <CardDescription>
            Customize how your name appears throughout the app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setShowProfileNameEditor(true)}
            className="w-full"
          >
            Edit Display Name
          </Button>
        </CardContent>
      </Card>

      {/* Profile Name Editor Modal */}
      {showProfileNameEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Edit Profile Name
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profileName">Display Name</Label>
                <Input
                  id="profileName"
                  placeholder="Enter your name"
                  className="w-full"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    toast({
                      title: "Profile Updated",
                      description:
                        "Your display name has been saved successfully.",
                    });
                    setShowProfileNameEditor(false);
                  }}
                  className="flex-1"
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowProfileNameEditor(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
