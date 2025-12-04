import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import {
  Download,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Shield,
  Zap,
  Star,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VersionUpdate {
  version: string;
  releaseDate: string;
  features: string[];
  improvements: string[];
  bugFixes: string[];
  securityUpdates: string[];
}

const latestVersion: VersionUpdate = {
  version: "5.6.0",
  releaseDate: "December 4, 2024",
  features: [
    "🎯 Unified Fitness Hub: Merged Fitness App Integrations and Smartwatch Hub",
    "🔒 Security Patch Updates with download and changelog",
    "💬 Enhanced Chat with AI features and improvements",
    "⚙️ All Settings sections enhanced with new features",
    "📊 Data Management Center for local data management",
    "📱 Mobile AI Coach with voice enhancements",
    "🛡️ Security Center with vulnerability fixes",
    "🔄 Smart Features: Sleep-based alarms and hydration reminders"
  ],
  improvements: [
    "Unified data sync across all connected apps and watches",
    "Improved notification management",
    "Better mobile responsiveness and performance",
    "Enhanced data persistence across sessions",
    "Modernized UI with consistent design system",
    "Real-time sync status updates across all devices"
  ],
  bugFixes: [
    "Fixed all security vulnerabilities",
    "Resolved sync issues across apps",
    "Fixed settings persistence problems",
    "Improved error handling throughout app",
    "Fixed mobile layout issues",
    "Corrected profile display bugs"
  ],
  securityUpdates: [
    "Critical security patches applied",
    "Enhanced encryption protocols",
    "Improved authentication security",
    "Fixed vulnerability in data handling",
    "Enhanced privacy controls"
  ]
};

export function VersionUpdateDialog() {
  const [open, setOpen] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const lastVersion = localStorage.getItem("app-version") || localStorage.getItem("fitfusion-app-version");
    const hasSeenUpdate = localStorage.getItem(`update-${latestVersion.version}`);

    if (lastVersion !== latestVersion.version && !hasSeenUpdate) {
      setTimeout(() => setOpen(true), 2000);
    }
  }, []);

  const handleInstall = async () => {
    setInstalling(true);
    setProgress(0);

    // Simulate installation progress with realistic steps
    const steps = [
      { progress: 10, delay: 300 },
      { progress: 25, delay: 400 },
      { progress: 40, delay: 500 },
      { progress: 60, delay: 400 },
      { progress: 80, delay: 300 },
      { progress: 95, delay: 200 },
      { progress: 100, delay: 100 },
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, step.delay));
      setProgress(step.progress);
    }

    // Update all version storage locations
    localStorage.setItem("app-version", latestVersion.version);
    localStorage.setItem("fitfusion-app-version", latestVersion.version);
    localStorage.setItem(`update-${latestVersion.version}`, "true");
    localStorage.setItem("fitfusion-last-update", new Date().toISOString());

    // Dispatch version update event
    window.dispatchEvent(
      new CustomEvent("versionUpdated", { detail: latestVersion.version })
    );

    setInstalling(false);
    setOpen(false);

    // Show success notification (not popup)
    window.dispatchEvent(
      new CustomEvent("showNotification", {
        detail: {
          type: "success",
          title: "✨ Update Installed!",
          message: `FitFusion ${latestVersion.version} is now active`,
        },
      })
    );

    // Reload to apply changes
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleSkip = () => {
    localStorage.setItem(`update-${latestVersion.version}`, "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">
                FitFusion {latestVersion.version} Available!
              </DialogTitle>
              <DialogDescription>
                Released {new Date(latestVersion.releaseDate).toLocaleDateString()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {/* New Features */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-5 w-5 text-yellow-500" />
                <h3 className="font-semibold text-lg">✨ New Features</h3>
              </div>
              <ul className="space-y-2">
                {latestVersion.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Improvements */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-lg">⚡ Improvements</h3>
              </div>
              <ul className="space-y-2">
                {latestVersion.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Bug Fixes */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold text-lg">🐛 Bug Fixes</h3>
              </div>
              <ul className="space-y-2">
                {latestVersion.bugFixes.map((fix, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                    <span>{fix}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Security Updates */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold text-lg">🔒 Security</h3>
              </div>
              <ul className="space-y-2">
                {latestVersion.securityUpdates.map((update, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span>{update}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </ScrollArea>

        {installing && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-center text-muted-foreground">
              Installing update... {progress}%
            </p>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={installing}
            className="w-full sm:w-auto"
          >
            Remind Me Later
          </Button>
          <Button
            onClick={handleInstall}
            disabled={installing}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {installing ? (
              <>
                <Download className="mr-2 h-4 w-4 animate-bounce" />
                Installing...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Install Update
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
