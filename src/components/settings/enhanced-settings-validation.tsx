
import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle, Shield, Smartphone, Wifi, Database, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function EnhancedSettingsValidation() {
  const [validationResults, setValidationResults] = useState<{[key: string]: ValidationResult}>({});
  const [isRunningValidation, setIsRunningValidation] = useState(false);
  const { toast } = useToast();

  // Integration settings
  const [integrationSettings, setIntegrationSettings] = useState({
    fitbitEnabled: false,
    googleFitEnabled: false,
    appleHealthEnabled: false,
    stravaEnabled: false,
    apiKeys: {
      weather: "",
      nutrition: "",
      spotify: ""
    },
    webhooks: {
      workoutComplete: "",
      goalAchieved: "",
      dataExport: ""
    }
  });

  // Privacy and security settings
  const [privacySettings, setPrivacySettings] = useState({
    dataSharing: false,
    analyticsEnabled: true,
    crashReporting: true,
    locationTracking: false,
    biometricAuth: false,
    autoLogout: 30,
    encryptionLevel: "high"
  });

  // Developer settings
  const [developerSettings, setDeveloperSettings] = useState({
    debugMode: false,
    apiLogging: false,
    performanceMonitoring: true,
    betaFeatures: false,
    testMode: false
  });

  const validateField = (fieldName: string, value: any, rules: any): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (rules.type) {
      case 'email':
        if (value && !/\S+@\S+\.\S+/.test(value)) {
          errors.push(`${fieldName} must be a valid email address`);
        }
        break;
      case 'url':
        if (value && !/^https?:\/\/.+/.test(value)) {
          errors.push(`${fieldName} must be a valid URL starting with http:// or https://`);
        }
        break;
      case 'number':
        if (value && (isNaN(value) || value < rules.min || value > rules.max)) {
          errors.push(`${fieldName} must be a number between ${rules.min} and ${rules.max}`);
        }
        break;
      case 'apiKey':
        if (value && value.length < 10) {
          warnings.push(`${fieldName} appears to be too short for a valid API key`);
        }
        break;
    }

    if (rules.required && !value) {
      errors.push(`${fieldName} is required`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  const runFullValidation = async () => {
    setIsRunningValidation(true);
    const results: {[key: string]: ValidationResult} = {};

    // Validate integration settings
    Object.entries(integrationSettings.apiKeys).forEach(([key, value]) => {
      results[`apiKey_${key}`] = validateField(
        `${key} API Key`,
        value,
        { type: 'apiKey', required: false }
      );
    });

    Object.entries(integrationSettings.webhooks).forEach(([key, value]) => {
      results[`webhook_${key}`] = validateField(
        `${key} Webhook`,
        value,
        { type: 'url', required: false }
      );
    });

    // Validate privacy settings
    results.autoLogout = validateField(
      'Auto Logout Time',
      privacySettings.autoLogout,
      { type: 'number', min: 5, max: 1440, required: true }
    );

    // Simulate async validation
    await new Promise(resolve => setTimeout(resolve, 1500));

    setValidationResults(results);
    setIsRunningValidation(false);

    const totalErrors = Object.values(results).reduce((sum, result) => sum + result.errors.length, 0);
    const totalWarnings = Object.values(results).reduce((sum, result) => sum + result.warnings.length, 0);

    if (totalErrors === 0) {
      toast({
        title: "Validation Complete",
        description: `All settings are valid${totalWarnings > 0 ? ` (${totalWarnings} warnings)` : ''}`,
      });
    } else {
      toast({
        title: "Validation Issues Found",
        description: `Found ${totalErrors} errors and ${totalWarnings} warnings`,
        variant: "destructive",
      });
    }
  };

  const saveSettings = async () => {
    await runFullValidation();
    
    const hasErrors = Object.values(validationResults).some(result => !result.isValid);
    if (hasErrors) {
      toast({
        title: "Cannot Save Settings",
        description: "Please fix all validation errors before saving",
        variant: "destructive",
      });
      return;
    }

    // Save settings logic here
    toast({
      title: "Settings Saved",
      description: "All settings have been saved successfully",
    });
  };

  const renderValidationIndicator = (fieldKey: string) => {
    const result = validationResults[fieldKey];
    if (!result) return null;

    if (!result.isValid) {
      return <Badge variant="destructive" className="ml-2">Error</Badge>;
    }
    
    if (result.warnings.length > 0) {
      return <Badge variant="secondary" className="ml-2">Warning</Badge>;
    }
    
    return <Badge variant="default" className="ml-2">Valid</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Enhanced Settings & Validation
        </CardTitle>
        <CardDescription>
          Configure integrations, privacy, and developer options with real-time validation
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="integrations" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="developer">Developer</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="integrations" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Fitness App Integrations
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fitbit">Fitbit</Label>
                  <Switch
                    id="fitbit"
                    checked={integrationSettings.fitbitEnabled}
                    onCheckedChange={(checked) => 
                      setIntegrationSettings(prev => ({ ...prev, fitbitEnabled: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="googlefit">Google Fit</Label>
                  <Switch
                    id="googlefit"
                    checked={integrationSettings.googleFitEnabled}
                    onCheckedChange={(checked) => 
                      setIntegrationSettings(prev => ({ ...prev, googleFitEnabled: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="applehealth">Apple Health</Label>
                  <Switch
                    id="applehealth"
                    checked={integrationSettings.appleHealthEnabled}
                    onCheckedChange={(checked) => 
                      setIntegrationSettings(prev => ({ ...prev, appleHealthEnabled: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="strava">Strava</Label>
                  <Switch
                    id="strava"
                    checked={integrationSettings.stravaEnabled}
                    onCheckedChange={(checked) => 
                      setIntegrationSettings(prev => ({ ...prev, stravaEnabled: checked }))
                    }
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  API Keys
                </h4>
                
                {Object.entries(integrationSettings.apiKeys).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <Label htmlFor={`api-${key}`} className="flex items-center">
                      {key.charAt(0).toUpperCase() + key.slice(1)} API Key
                      {renderValidationIndicator(`apiKey_${key}`)}
                    </Label>
                    <Input
                      id={`api-${key}`}
                      type="password"
                      placeholder={`Enter ${key} API key`}
                      value={value}
                      onChange={(e) => 
                        setIntegrationSettings(prev => ({
                          ...prev,
                          apiKeys: { ...prev.apiKeys, [key]: e.target.value }
                        }))
                      }
                    />
                    {validationResults[`apiKey_${key}`]?.errors.map((error, i) => (
                      <p key={i} className="text-sm text-destructive">{error}</p>
                    ))}
                    {validationResults[`apiKey_${key}`]?.warnings.map((warning, i) => (
                      <p key={i} className="text-sm text-yellow-600">{warning}</p>
                    ))}
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Webhooks
                </h4>
                
                {Object.entries(integrationSettings.webhooks).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <Label htmlFor={`webhook-${key}`} className="flex items-center">
                      {key.charAt(0).toUpperCase() + key.slice(1)} Webhook
                      {renderValidationIndicator(`webhook_${key}`)}
                    </Label>
                    <Input
                      id={`webhook-${key}`}
                      type="url"
                      placeholder={`https://example.com/webhooks/${key}`}
                      value={value}
                      onChange={(e) => 
                        setIntegrationSettings(prev => ({
                          ...prev,
                          webhooks: { ...prev.webhooks, [key]: e.target.value }
                        }))
                      }
                    />
                    {validationResults[`webhook_${key}`]?.errors.map((error, i) => (
                      <p key={i} className="text-sm text-destructive">{error}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Privacy & Security</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="datasharing">Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">Allow sharing anonymized data for research</p>
                  </div>
                  <Switch
                    id="datasharing"
                    checked={privacySettings.dataSharing}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, dataSharing: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics">Analytics</Label>
                    <p className="text-sm text-muted-foreground">Help improve the app with usage analytics</p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={privacySettings.analyticsEnabled}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, analyticsEnabled: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="crashreporting">Crash Reporting</Label>
                    <p className="text-sm text-muted-foreground">Automatically send crash reports</p>
                  </div>
                  <Switch
                    id="crashreporting"
                    checked={privacySettings.crashReporting}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, crashReporting: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="location">Location Tracking</Label>
                    <p className="text-sm text-muted-foreground">Enable GPS tracking for workouts</p>
                  </div>
                  <Switch
                    id="location"
                    checked={privacySettings.locationTracking}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, locationTracking: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="biometric">Biometric Authentication</Label>
                    <p className="text-sm text-muted-foreground">Use fingerprint/face unlock</p>
                  </div>
                  <Switch
                    id="biometric"
                    checked={privacySettings.biometricAuth}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, biometricAuth: checked }))
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="autologout" className="flex items-center">
                    Auto Logout (minutes)
                    {renderValidationIndicator('autoLogout')}
                  </Label>
                  <Input
                    id="autologout"
                    type="number"
                    min="5"
                    max="1440"
                    value={privacySettings.autoLogout}
                    onChange={(e) => 
                      setPrivacySettings(prev => ({ ...prev, autoLogout: parseInt(e.target.value) }))
                    }
                  />
                  {validationResults.autoLogout?.errors.map((error, i) => (
                    <p key={i} className="text-sm text-destructive">{error}</p>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="developer" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Developer Options</h3>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  These settings are for advanced users and developers only. Changing these may affect app performance.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="debugmode">Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable detailed logging and debug information</p>
                  </div>
                  <Switch
                    id="debugmode"
                    checked={developerSettings.debugMode}
                    onCheckedChange={(checked) => 
                      setDeveloperSettings(prev => ({ ...prev, debugMode: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="apilogging">API Logging</Label>
                    <p className="text-sm text-muted-foreground">Log all API requests and responses</p>
                  </div>
                  <Switch
                    id="apilogging"
                    checked={developerSettings.apiLogging}
                    onCheckedChange={(checked) => 
                      setDeveloperSettings(prev => ({ ...prev, apiLogging: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="performance">Performance Monitoring</Label>
                    <p className="text-sm text-muted-foreground">Track app performance metrics</p>
                  </div>
                  <Switch
                    id="performance"
                    checked={developerSettings.performanceMonitoring}
                    onCheckedChange={(checked) => 
                      setDeveloperSettings(prev => ({ ...prev, performanceMonitoring: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="beta">Beta Features</Label>
                    <p className="text-sm text-muted-foreground">Enable experimental features</p>
                  </div>
                  <Switch
                    id="beta"
                    checked={developerSettings.betaFeatures}
                    onCheckedChange={(checked) => 
                      setDeveloperSettings(prev => ({ ...prev, betaFeatures: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="testmode">Test Mode</Label>
                    <p className="text-sm text-muted-foreground">Use test data and endpoints</p>
                  </div>
                  <Switch
                    id="testmode"
                    checked={developerSettings.testMode}
                    onCheckedChange={(checked) => 
                      setDeveloperSettings(prev => ({ ...prev, testMode: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="validation" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Settings Validation</h3>
                <Button 
                  onClick={runFullValidation}
                  disabled={isRunningValidation}
                  variant="outline"
                >
                  {isRunningValidation ? (
                    <>
                      <Database className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Run Validation
                    </>
                  )}
                </Button>
              </div>
              
              {Object.keys(validationResults).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Validation Results</h4>
                  <div className="space-y-2">
                    {Object.entries(validationResults).map(([key, result]) => (
                      <div key={key} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{key.replace(/_/g, ' ')}</span>
                        <div className="flex items-center gap-2">
                          {result.isValid ? (
                            <Badge variant="default">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Valid
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Error
                            </Badge>
                          )}
                          {result.warnings.length > 0 && (
                            <Badge variant="secondary">
                              {result.warnings.length} Warning(s)
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={runFullValidation} disabled={isRunningValidation}>
            Validate All
          </Button>
          <Button onClick={saveSettings}>
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
