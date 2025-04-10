
import React, { useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ChevronLeft, Lock, Shield, Download, FileWarning, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  PrivacyPolicy, 
  TermsOfService, 
  DataDeletionRequest 
} from "@/components/legal-documents";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";

const Privacy = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("settings");
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const { toast } = useToast();

  // Handle password change
  const passwordForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handlePasswordChange = (data: any) => {
    // In a real app, this would connect to an authentication service
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Your new password and confirmation password don't match",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Password updated",
      description: "Your password has been successfully updated",
    });
    setShowChangePasswordDialog(false);
    passwordForm.reset();
  };

  // Handle data export
  const handleDataExport = () => {
    // In a real app, this would trigger an API call to prepare and download user data
    toast({
      title: "Data export initiated",
      description: "Your data export is being prepared and will be available for download shortly.",
    });
    
    // Simulate a delay before "completing" the export
    setTimeout(() => {
      toast({
        title: "Data export ready",
        description: "Your data export is ready for download.",
      });
      
      // Create a dummy JSON file for demonstration
      const dummyData = {
        profile: {
          name: "John Smith",
          email: "john.smith@example.com",
          joined: "April 2025"
        },
        workouts: [
          { date: "2025-04-01", name: "Upper Body", duration: "45 min" },
          { date: "2025-04-03", name: "Lower Body", duration: "50 min" }
        ]
      };
      
      const dataStr = JSON.stringify(dummyData, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      
      const exportLink = document.createElement('a');
      exportLink.setAttribute('href', dataUri);
      exportLink.setAttribute('download', 'fitfusion-data-export.json');
      document.body.appendChild(exportLink);
      exportLink.click();
      document.body.removeChild(exportLink);
    }, 2000);
  };

  // Handle two-factor authentication setup
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  const enableTwoFactor = () => {
    // In a real app, this would connect to an authentication service to enable 2FA
    if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      toast({
        title: "Invalid code",
        description: "Please enter a valid 6-digit verification code",
        variant: "destructive",
      });
      return;
    }
    
    setTwoFactorEnabled(true);
    toast({
      title: "Two-factor authentication enabled",
      description: "Your account is now more secure with 2FA enabled",
    });
    setShowTwoFactorDialog(false);
    setVerificationCode('');
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="fitness-gradient pt-12 pb-6 px-4">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="text-white p-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-white ml-2">Privacy & Security</h1>
        </div>
      </div>
      
      {/* Privacy Content */}
      <div className="px-4 py-6">
        <Tabs 
          defaultValue="settings" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings">
            <div className="bg-card rounded-lg shadow-sm divide-y">
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <Shield className="h-5 w-5 text-primary mr-2" />
                  <h3 className="font-medium">Privacy Controls</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="data-sharing" className="font-medium">Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">Share workout data with third-party apps</p>
                    </div>
                    <Switch id="data-sharing" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="analytics" className="font-medium">Analytics</Label>
                      <p className="text-sm text-muted-foreground">Help improve the app with usage data</p>
                    </div>
                    <Switch id="analytics" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="personalization" className="font-medium">Personalization</Label>
                      <p className="text-sm text-muted-foreground">Customize content based on your activity</p>
                    </div>
                    <Switch id="personalization" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <Lock className="h-5 w-5 text-primary mr-2" />
                  <h3 className="font-medium">Account Security</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="biometric" className="font-medium">Biometric Unlock</Label>
                      <p className="text-sm text-muted-foreground">Use Face ID or fingerprint to unlock</p>
                    </div>
                    <Switch id="biometric" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="activity-log" className="font-medium">Activity Log</Label>
                      <p className="text-sm text-muted-foreground">Track login activity</p>
                    </div>
                    <Switch id="activity-log" defaultChecked />
                  </div>
                  
                  <div>
                    <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full flex items-center justify-between">
                          <span className="flex items-center">
                            <Key className="h-4 w-4 mr-2" />
                            Change Password
                          </span>
                          <ChevronLeft className="h-4 w-4 rotate-180" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                          <DialogDescription>
                            Enter your current password and a new password below.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...passwordForm}>
                          <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                            <FormField
                              control={passwordForm.control}
                              name="currentPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Current Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={passwordForm.control}
                              name="newPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>New Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={passwordForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm New Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit">Update Password</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div>
                    <Dialog open={showTwoFactorDialog} onOpenChange={setShowTwoFactorDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full flex items-center justify-between">
                          <span className="flex items-center">
                            <Shield className="h-4 w-4 mr-2" />
                            Two-Factor Authentication
                          </span>
                          <ChevronLeft className="h-4 w-4 rotate-180" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Two-Factor Authentication</DialogTitle>
                          <DialogDescription>
                            {twoFactorEnabled 
                              ? "Two-factor authentication is currently enabled for your account."
                              : "Add an extra layer of security to your account by enabling two-factor authentication."}
                          </DialogDescription>
                        </DialogHeader>
                        
                        {twoFactorEnabled ? (
                          <div className="space-y-4">
                            <div className="p-4 bg-secondary/30 rounded-lg flex items-center">
                              <Shield className="h-5 w-5 text-primary mr-3" />
                              <div>
                                <p className="font-medium">Two-factor authentication is enabled</p>
                                <p className="text-sm text-muted-foreground">Your account is protected with an additional security layer</p>
                              </div>
                            </div>
                            <Button 
                              variant="destructive" 
                              className="w-full"
                              onClick={() => {
                                setTwoFactorEnabled(false);
                                toast({
                                  title: "Two-factor authentication disabled",
                                  description: "Your account no longer requires verification codes for sign in",
                                });
                              }}
                            >
                              Disable Two-Factor Authentication
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                              <div className="flex justify-center mb-4">
                                <div className="bg-primary/10 p-4 rounded-md">
                                  {/* This would be a QR code in a real application */}
                                  <div className="w-48 h-48 bg-gray-800 grid grid-cols-5 grid-rows-5 gap-1">
                                    {Array(25).fill(0).map((_, i) => (
                                      <div key={i} className={`${Math.random() > 0.6 ? 'bg-white' : 'bg-transparent'}`}></div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-center mb-2 font-medium">Scan QR code with authenticator app</p>
                              <p className="text-xs text-center text-muted-foreground">
                                Use Google Authenticator, Authy, or another app to scan this code
                              </p>
                            </div>
                            
                            <div>
                              <Label htmlFor="verification-code" className="font-medium">Verification Code</Label>
                              <p className="text-sm text-muted-foreground mb-2">Enter the 6-digit code from your authenticator app</p>
                              <Input
                                id="verification-code"
                                className="text-center tracking-widest text-lg"
                                maxLength={6}
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                placeholder="000000"
                              />
                            </div>
                            
                            <Button 
                              className="w-full"
                              onClick={enableTwoFactor}
                            >
                              Verify and Enable
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="documents">
            <PrivacyPolicy />
            <TermsOfService />
          </TabsContent>
          
          <TabsContent value="data">
            <DataDeletionRequest />
            
            <div className="mt-6 space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => setActiveTab("documents")}
              >
                <span>View Privacy Policy</span>
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <FileWarning className="h-4 w-4" />
                    Request Data Deletion
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently delete all your personal data from our systems. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => {
                        toast({
                          title: "Data deletion requested",
                          description: "Your request has been submitted. We will process it within 30 days and send confirmation to your email.",
                        });
                      }}
                    >
                      Confirm Deletion
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={handleDataExport}
              >
                <Download className="h-4 w-4" />
                Request Data Export
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default Privacy;
