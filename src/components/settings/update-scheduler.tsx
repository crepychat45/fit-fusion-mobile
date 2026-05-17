import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Moon,
  Wifi,
  Battery,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

interface ScheduleConfig {
  enableScheduling: boolean;
  preferredTime: string; // "night" | "morning" | "custom"
  customHour: number;
  autoDownload: boolean;
  autoInstall: boolean;
  requireWifi: boolean;
  requireCharging: boolean;
  excludeDates: string[];
}

export function UpdateScheduler() {
  const { toast } = useToast();
  const [config, setConfig] = useState<ScheduleConfig>(() => {
    const saved = localStorage.getItem("update-schedule-config");
    return saved
      ? JSON.parse(saved)
      : {
          enableScheduling: false,
          preferredTime: "night",
          customHour: 2,
          autoDownload: true,
          autoInstall: false,
          requireWifi: true,
          requireCharging: true,
          excludeDates: [],
        };
  });

  const [nextScheduledUpdate, setNextScheduledUpdate] = useState<Date | null>(
    null,
  );
  const [updatesSaved, setUpdatesSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem("update-schedule-config", JSON.stringify(config));
    setUpdatesSaved(true);
    setTimeout(() => setUpdatesSaved(false), 2000);
  }, [config]);

  useEffect(() => {
    calculateNextUpdate();
  }, [config.enableScheduling, config.preferredTime, config.customHour]);

  const calculateNextUpdate = () => {
    if (!config.enableScheduling) return;

    const now = new Date();
    const next = new Date();

    if (config.preferredTime === "night") {
      next.setHours(2, 0, 0, 0);
    } else if (config.preferredTime === "morning") {
      next.setHours(6, 0, 0, 0);
    } else {
      next.setHours(config.customHour, 0, 0, 0);
    }

    // If time has passed today, schedule for tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    setNextScheduledUpdate(next);
  };

  const handleToggleScheduling = () => {
    setConfig({
      ...config,
      enableScheduling: !config.enableScheduling,
    });

    toast({
      title: config.enableScheduling ? "Scheduling Disabled" : "Scheduling Enabled",
      description: config.enableScheduling
        ? "Update scheduling has been disabled"
        : "Updates will be scheduled according to your preferences",
    });
  };

  const handlePreferredTimeChange = (time: string) => {
    setConfig({
      ...config,
      preferredTime: time,
    });
  };

  const handleCustomHourChange = (hour: number) => {
    setConfig({
      ...config,
      customHour: Math.max(0, Math.min(23, hour)),
    });
  };

  const getTimeLabel = () => {
    if (config.preferredTime === "night") return "🌙 2:00 AM";
    if (config.preferredTime === "morning") return "🌅 6:00 AM";
    return `⏰ ${config.customHour}:00`;
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-blue-200 dark:border-blue-800">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/30">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Update Scheduler
          </CardTitle>
          <CardDescription>
            Configure automatic update scheduling based on your preferences
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Enable Scheduling */}
          <div className="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-950/10 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Enable Update Scheduling</p>
                <p className="text-sm text-muted-foreground">
                  Automatically download and install updates at scheduled times
                </p>
              </div>
            </div>
            <Switch
              checked={config.enableScheduling}
              onCheckedChange={handleToggleScheduling}
            />
          </div>

          {updatesSaved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Settings saved successfully
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {config.enableScheduling && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 p-4 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/10 dark:to-purple-950/10 rounded-lg border border-blue-200/30 dark:border-blue-800/20"
            >
              {/* Preferred Update Time */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Preferred Update Time
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "🌙 Night (2 AM)", value: "night" },
                    { label: "🌅 Morning (6 AM)", value: "morning" },
                    { label: "⏰ Custom", value: "custom" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        config.preferredTime === option.value
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handlePreferredTimeChange(option.value)}
                      className="text-sm"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>

                {config.preferredTime === "custom" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-white dark:bg-gray-900 rounded-lg border"
                  >
                    <label className="text-sm font-medium">Hour (0-23)</label>
                    <input
                      type="number"
                      min={0}
                      max={23}
                      value={config.customHour}
                      onChange={(e) =>
                        handleCustomHourChange(parseInt(e.target.value))
                      }
                      className="w-full mt-2 px-3 py-2 border rounded-md bg-background text-foreground"
                    />
                  </motion.div>
                )}
              </div>

              {/* Auto-Download */}
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-900/30 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Auto-Download Updates</span>
                </div>
                <Switch
                  checked={config.autoDownload}
                  onCheckedChange={(checked) =>
                    setConfig({
                      ...config,
                      autoDownload: checked,
                    })
                  }
                />
              </div>

              {/* Auto-Install */}
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-900/30 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Auto-Install Updates</span>
                </div>
                <Switch
                  checked={config.autoInstall}
                  onCheckedChange={(checked) =>
                    setConfig({
                      ...config,
                      autoInstall: checked,
                    })
                  }
                />
              </div>

              {/* Require WiFi */}
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-900/30 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Require WiFi Connection</span>
                </div>
                <Switch
                  checked={config.requireWifi}
                  onCheckedChange={(checked) =>
                    setConfig({
                      ...config,
                      requireWifi: checked,
                    })
                  }
                />
              </div>

              {/* Require Charging */}
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-900/30 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <Battery className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Require Charging</span>
                </div>
                <Switch
                  checked={config.requireCharging}
                  onCheckedChange={(checked) =>
                    setConfig({
                      ...config,
                      requireCharging: checked,
                    })
                  }
                />
              </div>

              {/* Next Scheduled Update */}
              {nextScheduledUpdate && (
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    Next scheduled update:{" "}
                    <span className="font-semibold">
                      {nextScheduledUpdate.toLocaleString()}
                    </span>
                  </AlertDescription>
                </Alert>
              )}
            </motion.div>
          )}

          {/* Info Box */}
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              When scheduling is enabled, updates will only install during your
              preferred time window when system requirements are met.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
