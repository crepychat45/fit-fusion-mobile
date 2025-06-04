
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Globe, 
  UserCheck, 
  AlertTriangle,
  CheckCircle,
  Info,
  Settings
} from "lucide-react";

interface PrivacySettings {
  dataCollection: boolean;
  analytics: boolean;
  crashReporting: boolean;
  locationTracking: boolean;
  biometricAuth: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: number;
  dataRetention: number;
  shareUsageData: boolean;
  personalizedAds: boolean;
  cookieConsent: boolean;
  thirdPartyIntegrations: boolean;
}

export function PrivacySettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PrivacySettings>({
    dataCollection: true,
    analytics: false,
    crashReporting: true,
    locationTracking: false,
    biometricAuth: false,
    twoFactorAuth: false,
    sessionTimeout: 30,
    dataRetention: 90,
    shareUsageData: false,
    personalizedAds: false,
    cookieConsent: true,
    thirdPartyIntegrations: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fitfusion-privacy-settings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setSettings(parsedSettings);
        console.log('Privacy settings loaded:', parsedSettings);
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      toast({
        title: "⚠️ Loading Error",
        description: "Could not load saved privacy settings.",
        variant: "destructive",
      });
    }
  }, []);

  // Save settings when they change
  useEffect(() => {
    if (hasChanges) {
      const timeout = setTimeout(() => {
        saveSettings();
      }, 1000); // Auto-save after 1 second of inactivity

      return () => clearTimeout(timeout);
    }
  }, [settings, hasChanges]);

  const saveSettings = async () => {
    try {
      setIsLoading(true);
      localStorage.setItem('fitfusion-privacy-settings', JSON.stringify(settings));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setHasChanges(false);
      
      toast({
        title: "✅ Settings Saved",
        description: "Your privacy preferences have been saved.",
      });
      
      console.log('Privacy settings saved:', settings);
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: "❌ Save Error",
        description: "Failed to save privacy settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (key: keyof PrivacySettings, value: boolean) => {
    console.log(`Toggling ${key} to ${value}`);
    
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    
    setHasChanges(true);
    
    // Show immediate feedback
    toast({
      title: `${formatSettingName(key)} ${value ? 'Enabled' : 'Disabled'}`,
      description: `Privacy setting updated successfully.`,
    });

    // Validate critical settings
    if (key === 'twoFactorAuth' || key === 'biometricAuth') {
      validateSecuritySettings();
    }
  };

  const handleNumberChange = (key: keyof PrivacySettings, value: number) => {
    console.log(`Changing ${key} to ${value}`);
    
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    
    setHasChanges(true);
    
    toast({
      title: `${formatSettingName(key)} Updated`,
      description: `Set to ${value} ${key === 'sessionTimeout' ? 'minutes' : 'days'}.`,
    });
  };

  const formatSettingName = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  const validateSecuritySettings = async () => {
    setValidationStatus('validating');
    
    try {
      // Simulate validation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const hasSecurityEnabled = settings.twoFactorAuth || settings.biometricAuth;
      setValidationStatus(hasSecurityEnabled ? 'valid' : 'invalid');
      
      if (!hasSecurityEnabled) {
        toast({
          title: "⚠️ Security Recommendation",
          description: "Consider enabling two-factor or biometric authentication for better security.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setValidationStatus('invalid');
      console.error('Validation error:', error);
    }
  };

  const exportPrivacyReport = async () => {
    try {
      setIsLoading(true);
      
      const report = {
        timestamp: new Date().toISOString(),
        settings: settings,
        recommendations: generateRecommendations(),
      };
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `privacy-report-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "📊 Report Generated",
        description: "Privacy report has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "❌ Export Failed",
        description: "Could not generate privacy report.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecommendations = () => {
    const recommendations = [];
    
    if (!settings.twoFactorAuth && !settings.biometricAuth) {
      recommendations.push("Enable two-factor or biometric authentication");
    }
    
    if (settings.locationTracking) {
      recommendations.push("Consider disabling location tracking if not needed");
    }
    
    if (settings.shareUsageData) {
      recommendations.push("Review usage data sharing preferences");
    }
    
    return recommendations;
  };

  const resetToDefaults = () => {
    const confirmed = window.confirm("Reset all privacy settings to defaults? This action cannot be undone.");
    if (!confirmed) return;

    const defaultSettings: PrivacySettings = {
      dataCollection: true,
      analytics: false,
      crashReporting: true,
      locationTracking: false,
      biometricAuth: false,
      twoFactorAuth: false,
      sessionTimeout: 30,
      dataRetention: 90,
      shareUsageData: false,
      personalizedAds: false,
      cookieConsent: true,
      thirdPartyIntegrations: false,
    };

    setSettings(defaultSettings);
    setHasChanges(true);

    toast({
      title: "🔄 Settings Reset",
      description: "All privacy settings have been reset to defaults.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Privacy Settings</h2>
          <p className="text-muted-foreground">Control how your data is collected and used</p>
        </div>
        
        <div className="flex items-center gap-2">
          {validationStatus === 'validating' && (
            <Badge variant="outline" className="animate-pulse">
              <Settings className="h-3 w-3 mr-1 animate-spin" />
              Validating
            </Badge>
          )}
          {validationStatus === 'valid' && (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Secure
            </Badge>
          )}
          {validationStatus === 'invalid' && (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Needs Attention
            </Badge>
          )}
        </div>
      </div>

      {/* Security Recommendations */}
      {validationStatus === 'invalid' && (
        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            Your current privacy settings may need attention. Consider enabling additional security features.
          </AlertDescription>
        </Alert>
      )}

      {/* Data Collection Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Data Collection
          </CardTitle>
          <CardDescription>
            Control what data is collected and how it's used
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="dataCollection">Basic Data Collection</Label>
              <p className="text-xs text-muted-foreground">
                Collect essential app usage data for functionality
              </p>
            </div>
            <Switch 
              id="dataCollection"
              checked={settings.dataCollection} 
              onCheckedChange={(checked) => handleToggle('dataCollection', checked)} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="analytics">Analytics</Label>
              <p className="text-xs text-muted-foreground">
                Help improve the app with anonymous usage analytics
              </p>
            </div>
            <Switch 
              id="analytics"
              checked={settings.analytics} 
              onCheckedChange={(checked) => handleToggle('analytics', checked)} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="crashReporting">Crash Reporting</Label>
              <p className="text-xs text-muted-foreground">
                Automatically send crash reports to help fix bugs
              </p>
            </div>
            <Switch 
              id="crashReporting"
              checked={settings.crashReporting} 
              onCheckedChange={(checked) => handleToggle('crashReporting', checked)} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="locationTracking">Location Tracking</Label>
              <p className="text-xs text-muted-foreground">
                Track your location for location-based features
              </p>
            </div>
            <Switch 
              id="locationTracking"
              checked={settings.locationTracking} 
              onCheckedChange={(checked) => handleToggle('locationTracking', checked)} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Authentication
          </CardTitle>
          <CardDescription>
            Enhance your account security with additional protection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="biometricAuth">Biometric Authentication</Label>
              <p className="text-xs text-muted-foreground">
                Use fingerprint or face unlock for app access
              </p>
            </div>
            <Switch 
              id="biometricAuth"
              checked={settings.biometricAuth} 
              onCheckedChange={(checked) => handleToggle('biometricAuth', checked)} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
              <p className="text-xs text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch 
              id="twoFactorAuth"
              checked={settings.twoFactorAuth} 
              onCheckedChange={(checked) => handleToggle('twoFactorAuth', checked)} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="sessionTimeout">Session Timeout</Label>
              <p className="text-xs text-muted-foreground">
                Automatically log out after inactivity (minutes)
              </p>
            </div>
            <select 
              className="w-24 rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={settings.sessionTimeout}
              onChange={(e) => handleNumberChange('sessionTimeout', parseInt(e.target.value))}
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={60}>60</option>
              <option value={120}>120</option>
              <option value={0}>Never</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Control how long your data is stored and shared
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="dataRetention">Data Retention Period</Label>
              <p className="text-xs text-muted-foreground">
                How long to keep your data (days)
              </p>
            </div>
            <select 
              className="w-24 rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={settings.dataRetention}
              onChange={(e) => handleNumberChange('dataRetention', parseInt(e.target.value))}
            >
              <option value={30}>30</option>
              <option value={90}>90</option>
              <option value={180}>180</option>
              <option value={365}>365</option>
              <option value={0}>Forever</option>
            </select>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="shareUsageData">Share Usage Data</Label>
              <p className="text-xs text-muted-foreground">
                Share anonymized usage data with third parties
              </p>
            </div>
            <Switch 
              id="shareUsageData"
              checked={settings.shareUsageData} 
              onCheckedChange={(checked) => handleToggle('shareUsageData', checked)} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="personalizedAds">Personalized Ads</Label>
              <p className="text-xs text-muted-foreground">
                Show ads based on your interests and activity
              </p>
            </div>
            <Switch 
              id="personalizedAds"
              checked={settings.personalizedAds} 
              onCheckedChange={(checked) => handleToggle('personalizedAds', checked)} 
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="thirdPartyIntegrations">Third-Party Integrations</Label>
              <p className="text-xs text-muted-foreground">
                Allow integrations with external services
              </p>
            </div>
            <Switch 
              id="thirdPartyIntegrations"
              checked={settings.thirdPartyIntegrations} 
              onCheckedChange={(checked) => handleToggle('thirdPartyIntegrations', checked)} 
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Info className="h-4 w-4 mr-2" />
            <span>Changes are automatically saved</span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportPrivacyReport}
              disabled={isLoading}
            >
              Export Report
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetToDefaults}
              disabled={isLoading}
            >
              Reset to Defaults
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
