import React, { useState, useMemo } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useSettings } from "@/contexts/settings-context";
import { useLanguage } from "@/contexts/language-context";
import { Languages, getFlagEmoji, getLanguageByCode } from "@/data/languages";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronRight, 
  Moon, 
  Sun, 
  User, 
  Shield, 
  CreditCard, 
  Watch,
  HelpCircle,
  Globe,
  Lock,
  BellRing,
  Gauge,
  Eye,
  Dumbbell,
  MessageSquare,
  AlertTriangle,
  Eraser,
  Users,
  RefreshCcw,
  CheckCircle,
  Download,
  Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [isClearingData, setIsClearingData] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState("appearance");
  const appVersion = "4.5.0"; // Updated version

  // Chat settings states
  const [chatEncryption, setChatEncryption] = useState(true);
  const [autoDeleteChats, setAutoDeleteChats] = useState(false);
  const [chatBackup, setChatBackup] = useState(true);
  const [showTypingIndicator, setShowTypingIndicator] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);
  const [chatAutoTranslate, setChatAutoTranslate] = useState(false);
  const [autoDeleteDays, setAutoDeleteDays] = useState("30");
  const [mediaQuality, setMediaQuality] = useState("high");
  
  // New version check states
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());
  const [showChangelog, setShowChangelog] = useState(false);

  // New privacy settings
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [screenshotBlocking, setScreenshotBlocking] = useState(false);
  const [secureStorage, setSecureStorage] = useState(true);

  const {
    theme,
    setTheme,
    language,
    setLanguage,
    subscriptionPlan,
    unitSystem,
    setUnitSystem,
    soundEnabled,
    setSoundEnabled,
    hapticFeedback,
    setHapticFeedback,
    compactView,
    setCompactView,
    showCalories,
    setShowCalories,
    showHeartRate,
    setShowHeartRate,
    codeEditorEnabled,
    setCCodeEditorEnabled: setCodeEditorEnabled,
    programmingLanguages,
    addProgrammingLanguage,
    removeProgrammingLanguage
  } = useSettings();

  const currentLanguage = useMemo(() => getLanguageByCode(language), [language]);

  const handleClearData = async () => {
    setIsClearingData(true);
    
    // Simulate clearing data
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsClearingData(false);
    toast({
      title: "Data Cleared",
      description: "All local data has been successfully cleared.",
    });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    // Simulate logging out
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoggingOut(false);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    navigate("/login");
  };

  const handleClearChatHistory = () => {
    toast({
      title: "Chat History Cleared",
      description: "All your chat conversations have been deleted.",
    });
  };

  const handleExportChats = () => {
    toast({
      title: "Chats Export Started",
      description: "Your chat history will be downloaded as a JSON file.",
    });
    // In a real app, this would generate and download a file
  };
  
  const checkForUpdates = () => {
    setIsCheckingUpdate(true);
    
    // Show checking animation
    toast({
      title: "Checking for updates...",
      description: "Please wait while we check for the latest version.",
    });
    
    // Simulate checking for updates
    setTimeout(() => {
      setIsCheckingUpdate(false);
      setLastChecked(new Date());
      setUpdateAvailable(true);
      
      toast({
        title: "Update available",
        description: "Version 4.5.1 is now available with new features.",
        variant: "default",
      });
    }, 2000);
  };
  
  const installUpdate = () => {
    setIsUpdating(true);
    setUpdateProgress(0);
    
    toast({
      title: "Installing update",
      description: "Starting download of version 4.5.1...",
    });
    
    // Simulate update progress
    const interval = setInterval(() => {
      setUpdateProgress(prev => {
        const newProgress = prev + 10;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsUpdating(false);
          setUpdateAvailable(false);
          
          toast({
            title: "Update complete",
            description: "FitFusion has been updated to version 4.5.1.",
            variant: "default",
          });
          
          return 0;
        }
        
        // Show progress toasts at specific intervals
        if (newProgress === 30) {
          toast({
            title: "Download progress: 30%",
            description: "Downloading update files...",
          });
        } else if (newProgress === 60) {
          toast({
            title: "Download progress: 60%",
            description: "Preparing to install...",
          });
        } else if (newProgress === 90) {
          toast({
            title: "Download progress: 90%",
            description: "Almost done...",
          });
        }
        
        return newProgress;
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="fitness-gradient pt-12 pb-6 px-4">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-white/80 text-sm mt-1">App Version {appVersion}</p>
      </div>
      
      <div className="px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6">
            <TabsTrigger value="appearance">
              <Eye className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Display</span>
            </TabsTrigger>
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Lock className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="developer">
              <Gauge className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Developer</span>
            </TabsTrigger>
            <TabsTrigger value="about">
              <HelpCircle className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">About</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger id="theme" className="w-[180px]">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center">
                          <Sun className="mr-2 h-4 w-4" />
                          <span>Light</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center">
                          <Moon className="mr-2 h-4 w-4" />
                          <span>Dark</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="language" className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Language
                  </Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" className="w-[180px]">
                      <SelectValue>
                        <div className="flex items-center">
                          <span className="mr-2">{getFlagEmoji(currentLanguage.code)}</span>
                          <span>{currentLanguage.name}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {Languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <div className="flex items-center">
                            <span className="mr-2">{getFlagEmoji(lang.code)}</span>
                            <span>{lang.name}</span>
                            {lang.nativeName && lang.nativeName !== lang.name && (
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({lang.nativeName})
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="unit-system">Unit System</Label>
                  <Select value={unitSystem} onValueChange={setUnitSystem}>
                    <SelectTrigger id="unit-system" className="w-[180px]">
                      <SelectValue placeholder="Select unit system" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                      <SelectItem value="imperial">Imperial (lbs, in)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="compact-view">Compact View</Label>
                  <Switch 
                    id="compact-view" 
                    checked={compactView} 
                    onCheckedChange={setCompactView} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-calories">Show Calories</Label>
                  <Switch 
                    id="show-calories" 
                    checked={showCalories} 
                    onCheckedChange={setShowCalories} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-heart-rate">Show Heart Rate</Label>
                  <Switch 
                    id="show-heart-rate" 
                    checked={showHeartRate} 
                    onCheckedChange={setShowHeartRate} 
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Accessibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound">Sound Effects</Label>
                  <Switch 
                    id="sound" 
                    checked={soundEnabled} 
                    onCheckedChange={setSoundEnabled} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="haptic-feedback">Haptic Feedback</Label>
                  <Switch 
                    id="haptic-feedback" 
                    checked={hapticFeedback} 
                    onCheckedChange={setHapticFeedback} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="youremail@example.com" disabled />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="********" disabled />
                </div>
                
                <div className="space-y-4 mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => navigate("/profile")}
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <span>Edit Profile</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => navigate("/privacy")}
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <span>Privacy & Security</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => navigate("/subscription")}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <span>Subscription Plan</span>
                    </div>
                    <Badge className="ml-2 bg-primary/10 text-primary">
                      {subscriptionPlan}
                    </Badge>
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => navigate("/wearables")}
                  >
                    <div className="flex items-center gap-3">
                      <Watch className="h-5 w-5 text-muted-foreground" />
                      <span>Connected Devices</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => navigate("/notifications")}
                  >
                    <div className="flex items-center gap-3">
                      <BellRing className="h-5 w-5 text-muted-foreground" />
                      <span>Notifications</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={handleClearData}
                  disabled={isClearingData}
                >
                  {isClearingData ? "Clearing Data..." : "Clear Local Data"}
                </Button>
                
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? "Logging Out..." : "Logout"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Privacy Tab - Enhanced */}
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="data-collection" className="block">Data Collection</Label>
                    <p className="text-xs text-muted-foreground">Allow anonymous usage data collection</p>
                  </div>
                  <Switch id="data-collection" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="biometric-login" className="block">Biometric Login</Label>
                    <p className="text-xs text-muted-foreground">Use fingerprint or face recognition</p>
                  </div>
                  <Switch 
                    id="biometric-login" 
                    checked={biometricEnabled} 
                    onCheckedChange={setBiometricEnabled} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="secure-chat" className="block">Enhanced Chat Security</Label>
                    <p className="text-xs text-muted-foreground">Enable end-to-end encryption for AI chats</p>
                  </div>
                  <Switch id="secure-chat" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="location-tracking" className="block">Location Services</Label>
                    <p className="text-xs text-muted-foreground">Allow location tracking for workouts</p>
                  </div>
                  <Switch id="location-tracking" defaultChecked />
                </div>
                
                {/* New Privacy Options */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor-auth" className="block">Two-Factor Authentication</Label>
                    <p className="text-xs text-muted-foreground">Require verification code at login</p>
                  </div>
                  <Switch 
                    id="two-factor-auth" 
                    checked={twoFactorAuth} 
                    onCheckedChange={setTwoFactorAuth} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="screenshot-blocking" className="block">Screenshot Blocking</Label>
                    <p className="text-xs text-muted-foreground">Prevent screenshots of sensitive data</p>
                  </div>
                  <Switch 
                    id="screenshot-blocking" 
                    checked={screenshotBlocking} 
                    onCheckedChange={setScreenshotBlocking} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="secure-storage" className="block">Secure Storage</Label>
                    <p className="text-xs text-muted-foreground">Encrypt all local data on device</p>
                  </div>
                  <Switch 
                    id="secure-storage" 
                    checked={secureStorage} 
                    onCheckedChange={setSecureStorage} 
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => navigate("/privacy")}
                >
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <span>Advanced Privacy Settings</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Data Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/export-data")}
                >
                  Download My Data
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                >
                  Request Account Deletion
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Chat Tab - New */}
          <TabsContent value="chat" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Chat Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="chat-encryption" className="block">End-to-End Encryption</Label>
                    <p className="text-xs text-muted-foreground">Secure your conversations with encryption</p>
                  </div>
                  <Switch 
                    id="chat-encryption" 
                    checked={chatEncryption} 
                    onCheckedChange={setChatEncryption} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="typing-indicator" className="block">Typing Indicator</Label>
                    <p className="text-xs text-muted-foreground">Show when others are typing</p>
                  </div>
                  <Switch 
                    id="typing-indicator" 
                    checked={showTypingIndicator} 
                    onCheckedChange={setShowTypingIndicator} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="chat-notifications" className="block">Chat Notifications</Label>
                    <p className="text-xs text-muted-foreground">Enable notifications for new messages</p>
                  </div>
                  <Switch 
                    id="chat-notifications" 
                    checked={chatNotifications} 
                    onCheckedChange={setChatNotifications} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="chat-backup" className="block">Cloud Backup</Label>
                    <p className="text-xs text-muted-foreground">Automatically back up your chats</p>
                  </div>
                  <Switch 
                    id="chat-backup" 
                    checked={chatBackup} 
                    onCheckedChange={setChatBackup} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-translate" className="block">Auto-Translate Messages</Label>
                    <p className="text-xs text-muted-foreground">Automatically translate messages to your language</p>
                  </div>
                  <Switch 
                    id="auto-translate" 
                    checked={chatAutoTranslate} 
                    onCheckedChange={setChatAutoTranslate} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-delete">Auto-Delete Messages</Label>
                  <div className="flex items-center gap-2">
                    <Switch 
                      id="auto-delete" 
                      checked={autoDeleteChats} 
                      onCheckedChange={setAutoDeleteChats} 
                    />
                    {autoDeleteChats && (
                      <Select value={autoDeleteDays} onValueChange={setAutoDeleteDays}>
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Select days" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 Days</SelectItem>
                          <SelectItem value="30">30 Days</SelectItem>
                          <SelectItem value="90">90 Days</SelectItem>
                          <SelectItem value="365">1 Year</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="media-quality">Media Quality</Label>
                  <Select value={mediaQuality} onValueChange={setMediaQuality}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="original">Original</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  <span>Privacy & Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="read-receipts" className="block">Read Receipts</Label>
                    <p className="text-xs text-muted-foreground">Let others know when you've read their messages</p>
                  </div>
                  <Switch id="read-receipts" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="online-status" className="block">Online Status</Label>
                    <p className="text-xs text-muted-foreground">Show when you're active in chat</p>
                  </div>
                  <Switch id="online-status" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="message-blocking" className="block">Message Blocking</Label>
                    <p className="text-xs text-muted-foreground">Block messages from non-contacts</p>
                  </div>
                  <Switch id="message-blocking" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  <span>Contacts & Groups</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => navigate("/chat/contacts")}
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span>Manage Contacts</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => navigate("/chat/blocked")}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                    <span>Blocked Users</span>
                  </div>
                  <Badge className="ml-2 bg-destructive/10 text-destructive">3</Badge>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <Eraser className="h-5 w-5 mr-2" />
                  <span>Data Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleClearChatHistory}
                >
                  Clear Chat History
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleExportChats}
                >
                  Export Chat Data
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Developer Tab */}
          <TabsContent value="developer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Developer Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="code-editor">Enable Code Editor</Label>
                  <Switch 
                    id="code-editor" 
                    checked={codeEditorEnabled} 
                    onCheckedChange={setCodeEditorEnabled} 
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Supported Languages</Label>
                  <div className="flex flex-wrap gap-2">
                    {programmingLanguages.map((lang) => (
                      <Badge key={lang} variant="secondary">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Input 
                    type="text" 
                    placeholder="Add Language" 
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addProgrammingLanguage(e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                  <Button onClick={() => {
                    const language = prompt("Enter language to add:");
                    if (language) {
                      addProgrammingLanguage(language);
                    }
                  }}>Add</Button>
                </div>
                
                <Button onClick={() => {
                  const language = prompt("Enter language to remove:");
                  if (language) {
                    removeProgrammingLanguage(language);
                  }
                }}>Remove Language</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* About Tab - Enhanced with changelog and version check */}
          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About FitFusion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div className="bg-primary/10 inline-flex rounded-full p-4 mb-3">
                    <Dumbbell className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">FitFusion</h3>
                  <p className="text-sm text-muted-foreground">Version {appVersion}</p>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <div>
                    <h4 className="font-medium">Current version</h4>
                    <p className="text-sm text-muted-foreground">
                      Last checked: {lastChecked.toLocaleDateString()} {lastChecked.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={checkForUpdates} 
                    disabled={isCheckingUpdate || isUpdating}
                    className="gap-2"
                  >
                    {isCheckingUpdate ? (
                      <>
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <RefreshCcw className="h-4 w-4" />
                        Check for updates
                      </>
                    )}
                  </Button>
                </div>
                
                {updateAvailable && (
                  <div className="bg-muted/50 p-3 rounded-md border border-amber-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                        <span className="font-medium">Update available: v4.5.1</span>
                      </div>
                      {isUpdating ? (
                        <span className="text-xs text-muted-foreground">{updateProgress}%</span>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={installUpdate}
                          className="flex items-center gap-1"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Install
                        </Button>
                      )}
                    </div>
                    
                    {isUpdating && (
                      <Progress value={updateProgress} className="h-2 mt-2" />
                    )}
                    
                    {!isUpdating && (
                      <div className="mt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs p-0 h-auto underline"
                          onClick={() => setShowChangelog(!showChangelog)}
                        >
                          {showChangelog ? "Hide changelog" : "View changelog"}
                        </Button>
                        
                        {showChangelog && (
                          <div className="mt-2 text-sm bg-background/80 p-2 rounded border">
                            <p className="font-medium text-xs mb-1">What's new in v4.5.1:</p>
                            <ul className="text-xs space-y-1 list-disc ml-4">
                              <li>Enhanced security features and dark mode optimization</li>
                              <li>Improved chat performance on all devices</li>
                              <li>Fixed display issues in mobile view</li>
                              <li>Added new profile features and updated workout tracking</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {updateProgress === 100 && (
                      <div className="mt-2 flex items-center text-green-500">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">Update completed! Restarting...</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">New in Version {appVersion}:</h4>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                      <li>Enhanced mobile layouts and responsive design</li>
                      <li>Fixed dark mode issues across all screens</li>
                      <li>Improved chat security with end-to-end encryption</li>
                      <li>Added version checking with interactive animations</li>
                      <li>Performance optimizations for better speed</li>
                      <li>Bug fixes related to notifications</li>
                    </ul>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <h4 className="text-sm font-medium">Previous Updates:</h4>
                    <div className="mt-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Badge variant="outline">v4.4.0</Badge>
                          <span className="text-xs text-muted-foreground">(Apr 15, 2025)</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-6"
                        >
                          Details
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            v4.3.5
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] h-5">Security Update</Badge>
                          <span className="text-xs text-muted-foreground">(Mar 28, 2025)</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-6"
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 pt-3 border-t">
                  <h4 className="text-sm font-medium">Contact Us</h4>
                  <p className="text-muted-foreground">
                    {t('settings.about.contact')}
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => navigate("/help")}
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                    <span>Help & Support</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <MobileNav />
    </div>
  );
};

export default Settings;
