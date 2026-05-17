import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Settings,
  Trash2,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsCategory {
  id: string;
  name: string;
  description: string;
  checked: boolean;
  icon: React.ReactNode;
}

const DEFAULT_SETTINGS: Record<string, any> = {
  theme: "system",
  fontSize: "base",
  animations: true,
  soundEnabled: true,
  notifications: true,
  emailNotifications: false,
  pushNotifications: true,
  privacyMode: false,
  dataCollection: true,
  analytics: true,
  autoUpdate: true,
  autoSave: true,
};

export function AdvancedSettingsReset() {
  const { toast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<SettingsCategory[]>([
    {
      id: "display",
      name: "Display Settings",
      description: "Theme, font size, animations",
      checked: true,
      icon: "🎨",
    },
    {
      id: "notifications",
      name: "Notification Settings",
      description: "All notification preferences",
      checked: true,
      icon: "🔔",
    },
    {
      id: "privacy",
      name: "Privacy Settings",
      description: "Privacy and data collection options",
      checked: false,
      icon: "🔒",
    },
    {
      id: "updates",
      name: "Update Settings",
      description: "Auto-update and version preferences",
      checked: false,
      icon: "📦",
    },
    {
      id: "chat",
      name: "Chat Settings",
      description: "Chat preferences and configuration",
      checked: true,
      icon: "💬",
    },
    {
      id: "accessibility",
      name: "Accessibility Settings",
      description: "Accessibility options and features",
      checked: false,
      icon: "♿",
    },
  ]);
  const [isResetting, setIsResetting] = useState(false);

  const handleCategoryToggle = (id: string) => {
    setSelectedCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, checked: !cat.checked } : cat
      )
    );
  };

  const handleSelectAll = () => {
    const allChecked = selectedCategories.every((cat) => cat.checked);
    setSelectedCategories((prev) =>
      prev.map((cat) => ({ ...cat, checked: !allChecked }))
    );
  };

  const handleReset = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsResetting(true);

    try {
      const categoriesToReset = selectedCategories.filter((cat) => cat.checked);

      // Simulate reset process
      for (const category of categoriesToReset) {
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Reset settings based on category
        switch (category.id) {
          case "display":
            localStorage.removeItem("display-settings");
            localStorage.removeItem("theme-preference");
            break;
          case "notifications":
            localStorage.removeItem("notification-settings");
            break;
          case "privacy":
            localStorage.removeItem("privacy-settings");
            break;
          case "updates":
            localStorage.removeItem("update-settings");
            localStorage.removeItem("update-schedule-config");
            break;
          case "chat":
            localStorage.removeItem("chat-settings");
            break;
          case "accessibility":
            localStorage.removeItem("accessibility-settings");
            break;
        }
      }

      toast({
        title: "✅ Settings Reset",
        description: `Successfully reset ${categoriesToReset.length} settings categories to defaults`,
      });

      setShowConfirm(false);
      
      // Reload page to apply changes
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Reset error:", error);
      toast({
        title: "❌ Reset Failed",
        description: "Failed to reset settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleExportSettings = () => {
    const settings: Record<string, any> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes("settings")) {
        settings[key] = localStorage.getItem(key);
      }
    }

    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });
    element.href = URL.createObjectURL(file);
    element.download = `fitfusion-settings-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "✅ Settings Exported",
      description: "Your settings have been exported successfully",
    });
  };

  const selectedCount = selectedCategories.filter((cat) => cat.checked).length;
  const allSelected = selectedCategories.every((cat) => cat.checked);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-amber-200 dark:border-amber-800">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-100/50 dark:from-amber-950/30 dark:to-orange-900/30">
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Reset Settings to Defaults
          </CardTitle>
          <CardDescription>
            Restore individual settings categories to their default values
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Warning Alert */}
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              Resetting settings will restore them to factory defaults. Your data will not be affected.
            </AlertDescription>
          </Alert>

          {/* Category Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Settings Categories</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs"
              >
                {allSelected ? "Deselect All" : "Select All"}
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {selectedCategories.map((category) => (
                <motion.div
                  key={category.id}
                  whileHover={{ scale: 1.01 }}
                  className="p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-900/20 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={category.checked}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{category.icon}</span>
                        <p className="font-medium text-sm">{category.name}</p>
                        {category.checked && (
                          <Badge variant="secondary" className="text-xs">
                            Will Reset
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Selected Count */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
              {selectedCount === 0
                ? "No settings selected"
                : `${selectedCount} categor${selectedCount === 1 ? "y" : "ies"} selected to reset`}
            </p>
          </div>

          {/* Confirmation */}
          <AnimatePresence>
            {showConfirm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <p className="font-medium text-red-700 dark:text-red-300">
                    Are you sure you want to reset these settings?
                  </p>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400">
                  This action cannot be undone. Your customizations will be lost.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleReset}
              disabled={selectedCount === 0 || isResetting}
              variant={showConfirm ? "destructive" : "outline"}
              className="flex-1"
            >
              {isResetting ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : showConfirm ? (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Confirm Reset
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Selected
                </>
              )}
            </Button>

            {showConfirm && (
              <Button
                onClick={() => setShowConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            )}

            <Button
              onClick={handleExportSettings}
              variant="outline"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
