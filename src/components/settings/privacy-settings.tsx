import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import {
  Eye,
  EyeOff,
  Shield,
  Database,
  Globe,
  Lock,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Settings,
  Trash2,
  Download,
  Upload,
  Activity,
  MapPin,
  Camera,
  Mic,
  Bell,
  Share2,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ConfirmDialog } from "./confirm-dialog";
import { PermissionCenter } from "@/components/permissions/permission-center";

/**
 * Persist a value under a `fitfusion-*` key so it flows through the
 * cloud-mirror (see src/utils/local-storage-sync.ts) into
 * public.user_settings.local_kv and back on sign-in / cross-device.
 */
function sameShape(a: unknown, b: unknown) {
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  return typeof a === typeof b;
}

function usePersistedState<T>(key: string, initial: T): [T, (v: T) => void] {
  // Guard against corrupted / type-shifted values coming from older builds or
  // the cloud mirror (e.g. a number where an array is expected) which would
  // otherwise crash components such as <Slider />.
  const parse = (raw: string | null): T => {
    if (raw === null) return initial;
    try {
      const parsed = JSON.parse(raw) as T;
      return sameShape(parsed, initial) ? parsed : initial;
    } catch {
      return initial;
    }
  };
  const [value, setValue] = useState<T>(() => {
    try {
      return parse(localStorage.getItem(key));
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota / private mode — ignore */
    }
  }, [key, value]);
  // React to cloud hydration events dispatched by local-storage-sync.
  useEffect(() => {
    const rehydrate = () => {
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) setValue(parse(raw));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("fitfusion-settings-hydrated", rehydrate);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) setValue(parse(e.newValue));
    };

    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("fitfusion-settings-hydrated", rehydrate);
      window.removeEventListener("storage", onStorage);
    };
  }, [key]);
  return [value, setValue];
}

export function PrivacySettings() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  const [profileVisibility, setProfileVisibility] = usePersistedState<string>("fitfusion-privacy-profile-visibility", "friends");
  const [dataCollection, setDataCollection] = usePersistedState("fitfusion-privacy-data-collection", true);
  const [analyticsEnabled, setAnalyticsEnabled] = usePersistedState("fitfusion-privacy-analytics", true);
  const [locationTracking, setLocationTracking] = usePersistedState("fitfusion-privacy-location", false);
  const [personalization, setPersonalization] = usePersistedState("fitfusion-privacy-personalization", true);
  const [thirdPartySharing, setThirdPartySharing] = usePersistedState("fitfusion-privacy-third-party", false);
  const [cookieConsent, setCookieConsent] = usePersistedState("fitfusion-privacy-cookies", true);
  const [dataRetention, setDataRetention] = usePersistedState<number[]>("fitfusion-privacy-retention", [365]);
  const retentionValue = Array.isArray(dataRetention) && typeof dataRetention[0] === "number"
    ? dataRetention
    : [365];

  const [aiTraining, setAiTraining] = usePersistedState("fitfusion-privacy-ai-training", false);
  const [biometricData, setBiometricData] = usePersistedState("fitfusion-privacy-biometric", true);
  const [voiceRecording, setVoiceRecording] = usePersistedState("fitfusion-privacy-voice", false);
  const [cameraAccess, setCameraAccess] = usePersistedState("fitfusion-privacy-camera", true);
  const [notificationTracking, setNotificationTracking] = usePersistedState("fitfusion-privacy-notif-tracking", true);
  const [socialSharing, setSocialSharing] = usePersistedState("fitfusion-privacy-social", false);
  const [advancedEncryption, setAdvancedEncryption] = usePersistedState("fitfusion-privacy-encryption", true);
  const [dataMinimization, setDataMinimization] = usePersistedState("fitfusion-privacy-minimization", true);
  const [consentManagement, setConsentManagement] = usePersistedState("fitfusion-privacy-consent", true);


  const handleDataExport = async () => {
    toast({
      title: "📦 Preparing data export",
      description: "Compiling your personal data for download...",
    });

    // Simulate data preparation
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = {
      profile: {
        /* user profile data */
      },
      preferences: {
        /* user preferences */
      },
      activity: {
        /* activity data */
      },
      privacy: {
        /* privacy settings */
      },
      exportDate: new Date().toISOString(),
      dataTypes: [
        "Profile Information",
        "Activity Logs",
        "Preferences",
        "Privacy Settings",
        "Device Information",
      ],
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitfusion-data-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "✅ Data exported successfully",
      description: "Your complete data archive has been downloaded.",
    });
  };

  const handleDataDeletion = async () => {
    toast({
      title: "🗑️ Deleting your data",
      description: "Permanently removing all personal information...",
    });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast({
      title: "✅ Data deleted",
      description: "All your personal data has been permanently removed.",
    });
  };

  const requestDataDeletion = () => setShowDeleteConfirm(true);

  const resetPrivacySettings = () => {
    setProfileVisibility("friends");
    setDataCollection(false);
    setAnalyticsEnabled(false);
    setLocationTracking(false);
    setPersonalization(false);
    setThirdPartySharing(false);
    setAiTraining(false);
    setBiometricData(false);
    setVoiceRecording(false);
    setSocialSharing(false);
    setDataRetention([90]);

    toast({
      title: "🔒 Privacy settings reset",
      description: "All settings have been set to maximum privacy.",
    });
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Device permissions */}
      <PermissionCenter />

      {/* Privacy Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Control Center
            </CardTitle>
            <CardDescription>
              Comprehensive control over your personal data and privacy
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium">Data Protected</p>
                <p className="text-sm text-muted-foreground">
                  End-to-end encryption
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <UserCheck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium">You're in Control</p>
                <p className="text-sm text-muted-foreground">
                  Full data ownership
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <Lock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium">Zero Knowledge</p>
                <p className="text-sm text-muted-foreground">
                  Server-side encryption
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={resetPrivacySettings}
                className="flex-1"
              >
                <Shield className="h-4 w-4 mr-2" />
                Maximum Privacy
              </Button>
              <Button
                variant="outline"
                onClick={handleDataExport}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Collection Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Collection & Usage
            </CardTitle>
            <CardDescription>
              Control what data we collect and how it's used
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Analytics & Performance</p>
                  <p className="text-sm text-muted-foreground">
                    Help improve the app with anonymous usage data
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {analyticsEnabled && (
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                )}
                <Switch
                  checked={analyticsEnabled}
                  onCheckedChange={setAnalyticsEnabled}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Location Tracking</p>
                  <p className="text-sm text-muted-foreground">
                    Enable location-based features and recommendations
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {locationTracking && (
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                )}
                <Switch
                  checked={locationTracking}
                  onCheckedChange={setLocationTracking}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Personalization Data</p>
                  <p className="text-sm text-muted-foreground">
                    Customize your experience based on preferences
                  </p>
                </div>
              </div>
              <Switch
                checked={personalization}
                onCheckedChange={setPersonalization}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Share2 className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Third-Party Data Sharing</p>
                  <p className="text-sm text-muted-foreground">
                    Share anonymized data with partners for research
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {thirdPartySharing && (
                  <Badge variant="destructive" className="text-xs">
                    Enabled
                  </Badge>
                )}
                <Switch
                  checked={thirdPartySharing}
                  onCheckedChange={setThirdPartySharing}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">AI Training Data</p>
                  <p className="text-sm text-muted-foreground">
                    Use your data to improve AI features (anonymized)
                  </p>
                </div>
              </div>
              <Switch checked={aiTraining} onCheckedChange={setAiTraining} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Device Permissions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Device Permissions & Access
            </CardTitle>
            <CardDescription>
              Manage what device features the app can access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Camera className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Camera Access</p>
                  <p className="text-sm text-muted-foreground">
                    Take photos and scan QR codes
                  </p>
                </div>
              </div>
              <Switch
                checked={cameraAccess}
                onCheckedChange={setCameraAccess}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mic className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Microphone Access</p>
                  <p className="text-sm text-muted-foreground">
                    Voice commands and audio recording
                  </p>
                </div>
              </div>
              <Switch
                checked={voiceRecording}
                onCheckedChange={setVoiceRecording}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Notification Tracking</p>
                  <p className="text-sm text-muted-foreground">
                    Track notification engagement for optimization
                  </p>
                </div>
              </div>
              <Switch
                checked={notificationTracking}
                onCheckedChange={setNotificationTracking}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCheck className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Biometric Data Storage</p>
                  <p className="text-sm text-muted-foreground">
                    Store fingerprint/face data locally for quick access
                  </p>
                </div>
              </div>
              <Switch
                checked={biometricData}
                onCheckedChange={setBiometricData}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Privacy Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Visibility & Sharing Controls
            </CardTitle>
            <CardDescription>
              Control who can see your information and activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Profile Visibility</p>
                <p className="text-sm text-muted-foreground">
                  Who can see your profile and activity
                </p>
              </div>
              <Select
                value={profileVisibility}
                onValueChange={setProfileVisibility}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Share2 className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Social Media Sharing</p>
                  <p className="text-sm text-muted-foreground">
                    Allow sharing achievements to social platforms
                  </p>
                </div>
              </div>
              <Switch
                checked={socialSharing}
                onCheckedChange={setSocialSharing}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">Data Retention Period</p>
                <Badge variant="outline">{retentionValue[0]} days</Badge>
              </div>
              <Slider
                value={retentionValue}

                onValueChange={setDataRetention}
                max={730}
                min={30}
                step={30}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>30 days</span>
                <span>1 year</span>
                <span>2 years</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Management Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Data Rights & Management
            </CardTitle>
            <CardDescription>
              Exercise your data rights under GDPR and other privacy laws
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                You have the right to access, correct, delete, or port your data
                at any time. These actions are immediate and permanent.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={handleDataExport}
                className="w-full h-auto p-4 justify-start"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Download className="h-4 w-4" />
                    <span className="font-medium">Export My Data</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Download all your personal data in JSON format
                  </div>
                </div>
              </Button>

              <Button
                variant="destructive"
                onClick={requestDataDeletion}
                className="w-full h-auto p-4 justify-start"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Trash2 className="h-4 w-4" />
                    <span className="font-medium">Delete My Data</span>
                  </div>
                  <div className="text-xs">
                    Permanently remove all personal information
                  </div>
                </div>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Advanced Data Minimization</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically delete unnecessary data
                  </p>
                </div>
                <Switch
                  checked={dataMinimization}
                  onCheckedChange={setDataMinimization}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDataDeletion}
        title="Delete all your data?"
        description="This permanently removes your personal data from this device and the connected account. This action cannot be undone."
        confirmLabel="Delete permanently"
        destructive
        typeToConfirm="DELETE"
      />
    </div>
  );
}
