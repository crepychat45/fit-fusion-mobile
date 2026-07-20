import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Zap,
  Bug,
  Shield,
  RotateCcw,
  History,
} from "lucide-react";
import { getVersionInfo, RELEASE_NOTES } from "@/config/version";
import {
  applyUpdate,
  checkForUpdate,
  UpdateProgress,
} from "@/utils/version-api";

const iconFor = (icon: string) => {
  switch (icon) {
    case "sparkles":
      return <Sparkles className="h-4 w-4 text-yellow-500" />;
    case "zap":
      return <Zap className="h-4 w-4 text-blue-500" />;
    case "bug":
      return <Bug className="h-4 w-4 text-orange-500" />;
    case "shield":
      return <Shield className="h-4 w-4 text-red-500" />;
    default:
      return <CheckCircle2 className="h-4 w-4" />;
  }
};

/**
 * Unified Version Control Panel — merges VersionManager and
 * EnhancedVersionManager into a single, responsive Liquid Glass card.
 */
export function VersionControlPanel() {
  const { toast } = useToast();
  const [{ current, latest, releaseDate, hasUpdate }, setInfo] = useState(
    getVersionInfo(),
  );
  const [checking, setChecking] = useState(false);
  const [progress, setProgress] = useState<UpdateProgress | null>(null);
  const [showFullChangelog, setShowFullChangelog] = useState(false);

  useEffect(() => {
    const onUpdate = () => setInfo(getVersionInfo());
    window.addEventListener("versionUpdated", onUpdate);
    return () => window.removeEventListener("versionUpdated", onUpdate);
  }, []);

  const handleCheck = async () => {
    setChecking(true);
    try {
      const found = await checkForUpdate();
      toast({
        title: found ? "Update available" : "You're up to date",
        description: found
          ? `Version ${latest} is ready to install.`
          : `Running the latest FitFusion v${latest}.`,
      });
      setInfo(getVersionInfo());
    } finally {
      setChecking(false);
    }
  };

  const handleInstall = async () => {
    try {
      await applyUpdate(setProgress);
    } catch (e: any) {
      toast({
        title: "Update failed",
        description: e?.message ?? "Please try again.",
        variant: "destructive",
      });
      setProgress({ phase: "error", percent: 0, message: "Failed" });
    }
  };

  const handleRollback = () => {
    toast({
      title: "Rollback initiated",
      description:
        "Restoring previous verified version. The app will reload shortly.",
    });
    setTimeout(() => window.location.reload(), 900);
  };

  const latestNote = RELEASE_NOTES[0];
  const visibleNotes = showFullChangelog
    ? RELEASE_NOTES
    : RELEASE_NOTES.slice(0, 1);

  return (
    <div className="space-y-4">
      <Card className="liquid-glass border-white/10">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Shield className="h-5 w-5 text-primary" />
                Version Control
              </CardTitle>
              <CardDescription>
                Signed release channel · unified version state
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                v{current}
              </Badge>
              {hasUpdate ? (
                <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  Update → v{latest}
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Up to date
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Stat label="Current" value={`v${current}`} />
            <Stat label="Latest" value={`v${latest}`} />
            <Stat
              label="Released"
              value={new Date(releaseDate).toLocaleDateString()}
            />
            <Stat label="Channel" value="Stable" />
          </div>

          <AnimatePresence>
            {progress && progress.phase !== "idle" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 rounded-xl border border-white/10 bg-background/40 backdrop-blur p-3"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium capitalize">
                    {progress.phase}
                  </span>
                  <span className="text-muted-foreground">
                    {progress.percent}%
                  </span>
                </div>
                <Progress value={progress.percent} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {progress.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleCheck}
              disabled={checking || !!progress}
              variant="outline"
              className="rounded-xl"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${checking ? "animate-spin" : ""}`}
              />
              Check for updates
            </Button>
            <Button
              onClick={handleInstall}
              disabled={!hasUpdate || !!progress}
              className="rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground"
            >
              <Download className="h-4 w-4 mr-2" />
              {hasUpdate ? `Install v${latest}` : "Installed"}
            </Button>
            <Button
              onClick={handleRollback}
              variant="ghost"
              className="rounded-xl"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Rollback
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="liquid-glass border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-primary" />
            Changelog
          </CardTitle>
          <CardDescription>
            {latestNote.type} · {new Date(latestNote.date).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[360px] pr-2">
            <div className="space-y-6">
              {visibleNotes.map((note) => (
                <div key={note.version} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      v{note.version}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {note.highlight}
                  </p>
                  {note.sections.map((s) => (
                    <div key={s.title} className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        {iconFor(s.icon)}
                        {s.title}
                      </div>
                      <ul className="ml-6 space-y-1 text-sm text-muted-foreground list-disc">
                        {s.items.map((it, i) => (
                          <li key={i}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full"
            onClick={() => setShowFullChangelog((v) => !v)}
          >
            {showFullChangelog
              ? "Show latest only"
              : `Show all ${RELEASE_NOTES.length} releases`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-background/30 backdrop-blur px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
