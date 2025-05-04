
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
  Dumbbell
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [isClearingData, setIsClearingData] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState("appearance");

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

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="fitness-gradient pt-12 pb-6 px-4">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-white/80 text-sm mt-1">App Version 3.5.2</p>
      </div>
      
      <div className="px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5">
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
          
          {/* Privacy Tab */}
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
                  <Switch id="biometric-login" defaultChecked />
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
          
          {/* About Tab */}
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
                  <p className="text-sm text-muted-foreground">Version 3.5.2</p>
                </div>
                
                <p>
                  FitFusion is a comprehensive fitness platform designed to help you track your workouts, monitor your progress, and achieve your fitness goals with personalized guidance.
                </p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">New in Version 3.5.2:</h4>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Enhanced security features</li>
                    <li>Improved AI assistant</li>
                    <li>Added language preferences</li>
                    <li>New unit system options</li>
                    <li>Performance improvements</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
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
