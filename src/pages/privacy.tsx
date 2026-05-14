import React, { useState } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Lock,
  FileText,
  CloudOff,
  Share2,
  MapPin,
  Bell,
  Trash2,
  Info,
  ChevronRight,
  ArrowUpRight,
  Download,
  User,
  Fingerprint,
  Eye,
  Key,
  AlertTriangle,
  ChevronLeft,
  FileCode2,
  Cpu,
  Radio,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/language-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  exportUserData,
  getEstimatedFileSize,
  downloadFile,
} from "@/utils/sound-exports";
import { PrivacySettings } from "@/components/settings/privacy-settings";

const Privacy = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [locationEnabled, setLocationEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dataSync, setDataSync] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [runwaysEnabled, setRunwaysEnabled] = useState(false);
  const [aiAssistance, setAiAssistance] = useState(true);
  const [dataEncryption, setDataEncryption] = useState(true);
  const [codeEditorEnabled, setCCodeEditorEnabled] = useState(false);

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("json");
  const [exportCategories, setExportCategories] = useState<string[]>([
    "workouts",
  ]);
  const [exportTimeRange, setExportTimeRange] = useState("30days");
  const [isExporting, setIsExporting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const [showFullSettings, setShowFullSettings] = useState(false);

  const handleToggle = (setting: string, value: boolean) => {
    switch (setting) {
      case "Location Services":
        setLocationEnabled(value);
        break;
      case "Notifications":
        setNotificationsEnabled(value);
        break;
      case "Data Synchronization":
        setDataSync(value);
        break;
      case "Biometric Authentication":
        setBiometricAuth(value);
        break;
      case "Runways Design":
        setRunwaysEnabled(value);
        break;
      case "AI Assistant":
        setAiAssistance(value);
        break;
      case "Code Editor":
        setCCodeEditorEnabled(value);
        break;
      default:
        break;
    }

    toast({
      title: `${setting} ${value ? "Enabled" : "Disabled"}`,
      description: `Your privacy settings have been updated.`,
    });
  };

  const handleAction = (action: string) => {
    switch (action) {
      case "Download Your Data":
        setExportDialogOpen(true);
        break;
      case "Privacy Policy":
        toast({
          title: "Privacy Policy",
          description: "Opening privacy policy document...",
        });
        setTimeout(() => {
          window.open("https://example.com/privacy-policy", "_blank");
        }, 500);
        break;
      case "Data Encryption":
        setDataEncryption(!dataEncryption);
        toast({
          title: dataEncryption ? "Encryption Disabled" : "Encryption Enabled",
          description: dataEncryption
            ? "Your data is no longer encrypted."
            : "Your data is now encrypted using industry-standard protocols.",
        });
        break;
      case "Change Password":
        navigate("/settings");
        break;
      case "Clear Cached Data":
        toast({
          title: "Clearing Cache",
          description: "Removing temporary data from your device...",
        });
        setTimeout(() => {
          toast({
            title: "Cache Cleared",
            description:
              "All temporary data has been removed from your device.",
          });
        }, 1500);
        break;
      case "Manage Third-Party Access":
        toast({
          title: "Third-Party Data Access",
          description: "Managing connected services...",
        });
        setTimeout(() => {
          toast({
            title: "No Connected Services",
            description:
              "You haven't granted access to any third-party services.",
          });
        }, 1500);
        break;
      case "Device Access Log":
        navigate("/device-access");
        toast({
          title: "Device Access Log",
          description: "Viewing all devices that have accessed your account.",
        });
        break;
      default:
        toast({
          title: action,
          description: "Feature will be implemented soon.",
        });
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    setDownloadUrl(null);

    try {
      // Convert UI selections to the format expected by exportUserData
      const config = {
        fileType: exportFormat as any,
        categories: exportCategories as any[],
        timeRange: getTimeRangeFromSelection(exportTimeRange),
        includeMedia: false,
        anonymized: false,
      };

      // Simulate export process with delay
      setTimeout(async () => {
        try {
          const url = await exportUserData(config);
          setDownloadUrl(url);
          setIsExporting(false);

          toast({
            title: "Data Export Ready",
            description:
              "Your data has been exported successfully. Click to download.",
            action: (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (downloadUrl) {
                    const fileName = `fitfusion-export-${new Date().toISOString().slice(0, 10)}.${exportFormat}`;
                    downloadFile(downloadUrl, fileName);
                  }
                }}
              >
                Download
              </Button>
            ),
          });
        } catch (error) {
          console.error("Export error:", error);
          setIsExporting(false);

          toast({
            title: "Export Failed",
            description:
              "There was an error exporting your data. Please try again.",
            variant: "destructive",
          });
        }
      }, 2000);
    } catch (error) {
      console.error("Export setup error:", error);
      setIsExporting(false);

      toast({
        title: "Export Failed",
        description:
          "There was an error setting up the export. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const fileName = `fitfusion-export-${new Date().toISOString().slice(0, 10)}.${exportFormat}`;
      downloadFile(downloadUrl, fileName);

      toast({
        title: "Download Started",
        description: `Your ${exportFormat.toUpperCase()} file is being downloaded.`,
      });

      setExportDialogOpen(false);
    }
  };

  const getTimeRangeFromSelection = (selection: string) => {
    const now = new Date();
    let start = new Date();

    switch (selection) {
      case "7days":
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30days":
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90days":
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case "all":
        start = new Date(0); // Beginning of time (for the app)
        break;
    }

    return { start, end: now };
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="fitness-gradient pt-12 pb-6 px-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-white p-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-white ml-2">
            {t("privacy.title")}
          </h1>
        </div>
      </header>

      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-medium">{t("privacy.status")}</h2>
              <p className="text-xs text-muted-foreground">
                Your account is protected
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            {dataEncryption ? "Secure" : "Basic"}
          </Badge>
        </div>

        {showFullSettings ? (
          <div className="space-y-6">
            <Button
              variant="outline"
              size="sm"
              className="mb-4"
              onClick={() => setShowFullSettings(false)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Basic Settings
            </Button>
            <PrivacySettings />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Permissions Section */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                PERMISSIONS
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Location Services</p>
                      <p className="text-xs text-muted-foreground">
                        Used for workout tracking
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={locationEnabled}
                    onCheckedChange={(checked) => {
                      handleToggle("Location Services", checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Notifications</p>
                      <p className="text-xs text-muted-foreground">
                        Workout reminders and updates
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={(checked) => {
                      handleToggle("Notifications", checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CloudOff className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Data Synchronization</p>
                      <p className="text-xs text-muted-foreground">
                        Sync data across devices
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={dataSync}
                    onCheckedChange={(checked) => {
                      handleToggle("Data Synchronization", checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Fingerprint className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Biometric Authentication</p>
                      <p className="text-xs text-muted-foreground">
                        Use fingerprint or Face ID
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={biometricAuth}
                    onCheckedChange={(checked) => {
                      handleToggle("Biometric Authentication", checked);
                    }}
                  />
                </div>

                {/* Developer Features Section */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileCode2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Code Editor</p>
                      <p className="text-xs text-muted-foreground">
                        JavaScript, Python, C++, HTML/CSS
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={codeEditorEnabled}
                    onCheckedChange={(checked) => {
                      handleToggle("Code Editor", checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Cpu className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">AI Assistant</p>
                      <p className="text-xs text-muted-foreground">
                        Personalized workout assistance
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={aiAssistance}
                    onCheckedChange={(checked) => {
                      handleToggle("AI Assistant", checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Radio className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Runways Design</p>
                      <p className="text-xs text-muted-foreground">
                        Advanced UI customization
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={runwaysEnabled}
                    onCheckedChange={(checked) => {
                      handleToggle("Runways Design", checked);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Data & Privacy Section */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                DATA & PRIVACY
              </h3>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => handleAction("Download Your Data")}
                >
                  <div className="flex items-center gap-3">
                    <Download className="h-5 w-5 text-muted-foreground" />
                    <span>Download Your Data</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setShowFullSettings(true)}
                >
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    <span>Advanced Privacy Settings</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => handleAction("Privacy Policy")}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span>Privacy Policy</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => handleAction("Data Encryption")}
                >
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <span>Data Encryption</span>
                  </div>
                  <Badge variant="outline" className="rounded-full text-xs">
                    {dataEncryption ? "Enabled" : "Disabled"}
                  </Badge>
                </Button>

                {/* New Data Control Options */}
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => handleAction("Clear Cached Data")}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 flex items-center justify-center text-muted-foreground">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2v4" />
                        <path d="M12 18v4" />
                        <path d="m4.93 4.93 2.83 2.83" />
                        <path d="m16.24 16.24 2.83 2.83" />
                        <path d="M2 12h4" />
                        <path d="M18 12h4" />
                        <path d="m4.93 19.07 2.83-2.83" />
                        <path d="m16.24 7.76 2.83-2.83" />
                      </svg>
                    </div>
                    <span>Clear Cached Data</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => handleAction("Manage Third-Party Access")}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 flex items-center justify-center text-muted-foreground">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="m15 9-6 6" />
                        <path d="m9 9 6 6" />
                      </svg>
                    </div>
                    <span>Manage Third-Party Access</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Account Section */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                ACCOUNT
              </h3>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => handleAction("Change Password")}
                >
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <span>Change Password</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => navigate("/wearables")}
                >
                  <div className="flex items-center gap-3">
                    <Share2 className="h-5 w-5 text-muted-foreground" />
                    <span>Connected Accounts</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => handleAction("Device Access Log")}
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span>Device Access Log</span>
                  </div>
                  <Badge className="rounded-full bg-gray-100 text-gray-600 text-xs">
                    New
                  </Badge>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between text-destructive hover:text-destructive"
                  onClick={() => {
                    toast({
                      title: "Account Deletion Requested",
                      description:
                        "Please check your email to confirm account deletion.",
                      variant: "destructive",
                    });
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-5 w-5" />
                    <span>Delete Account</span>
                  </div>
                  <AlertTriangle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Export Your Data</DialogTitle>
            <DialogDescription>
              Choose the format and data you want to export. The file will be
              available for download once ready.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="data" className="mt-4">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="data">Select Data</TabsTrigger>
              <TabsTrigger value="options">Export Options</TabsTrigger>
            </TabsList>

            <TabsContent value="data" className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Choose data to export</h4>
                <div className="space-y-2">
                  {[
                    "workouts",
                    "progress",
                    "nutrition",
                    "sleep",
                    "activity",
                    "heart-rate",
                  ].map((category) => (
                    <div className="flex items-start space-x-2" key={category}>
                      <Checkbox
                        id={`category-${category}`}
                        checked={exportCategories.includes(category)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setExportCategories([
                              ...exportCategories,
                              category,
                            ]);
                          } else {
                            setExportCategories(
                              exportCategories.filter((c) => c !== category),
                            );
                          }
                        }}
                      />
                      <div className="grid gap-1">
                        <Label
                          htmlFor={`category-${category}`}
                          className="capitalize"
                        >
                          {category.replace("-", " ")}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Time range</h4>
                <Select
                  value={exportTimeRange}
                  onValueChange={setExportTimeRange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="year">Last year</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="options" className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Export format</h4>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Estimated file size:</span>
                  <Badge variant="outline">
                    {getEstimatedFileSize(exportCategories as any)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    Includes personal information:
                  </span>
                  <span className="text-sm font-medium">Yes</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Processing time:</span>
                  <span className="text-sm font-medium">~1-2 minutes</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            {downloadUrl ? (
              <Button onClick={handleDownload}>Download File</Button>
            ) : (
              <Button
                onClick={handleExportData}
                disabled={isExporting || exportCategories.length === 0}
              >
                {isExporting ? "Preparing Export..." : "Export Data"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MobileNav />
    </div>
  );
};

export default Privacy;
