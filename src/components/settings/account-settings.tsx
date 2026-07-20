import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Key, Shield, LogOut, Smartphone, Laptop, Trash2, Download, Bell, Eye, Camera } from "lucide-react";
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

export function UpgradedAccountSettings() {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Settings States
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isPrivateProfile, setIsPrivateProfile] = useState(false);

  // Global Logout Fix
  const handleSignOutAll = async () => {
    setIsLoading(true);
    try {
      // Supabase Global Sign Out
      await supabase.auth.signOut({ scope: "global" });
      toast({
        title: "Signed Out",
        description: "Successfully logged out from all active sessions.",
      });
    } catch (err: any) {
      toast({
        title: "Logout Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Export Data Feature
  const handleExportData = async () => {
    toast({
      title: "Preparing Data",
      description: "Your user data archive is being generated...",
    });
    // Add logic to aggregate user local logs / Supabase records
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Privacy & Notification Quick Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" /> Preferences & Privacy
          </CardTitle>
          <CardDescription>Manage how your account behaves and alerts you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl border">
            <div>
              <p className="font-medium text-sm">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive weekly workout reports and updates</p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border">
            <div>
              <p className="font-medium text-sm">Private Account</p>
              <p className="text-xs text-muted-foreground">Hide your workout history from public leaderboards</p>
            </div>
            <Switch checked={isPrivateProfile} onCheckedChange={setIsPrivateProfile} />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" /> Danger Zone
          </CardTitle>
          <CardDescription>Irreversible account management actions</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" onClick={handleExportData} className="gap-2">
            <Download className="h-4 w-4" /> Export Personal Data
          </Button>
          <Button variant="destructive" className="gap-2">
            <Trash2 className="h-4 w-4" /> Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
