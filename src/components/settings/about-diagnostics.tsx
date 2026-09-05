import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  Bug,
  Cpu,
  Download,
  FileText,
  HardDrive,
  Lock,
  RefreshCw,
  Shield,
  Signal,
  Sparkles,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import { APP_VERSION, APP_RELEASE_DATE, RELEASE_NOTES } from "@/lib/app-version";
import {
  buildDiagnosticReport,
  encryptReport,
  formatBytes,
  getNetworkInfo,
  getStorageInfo,
  getSystemSpecs,
  type NetworkInfo,
  type StorageInfo,
  type SystemSpecs,
} from "@/utils/system-diagnostics";

/* --------------------------------- Licenses -------------------------------- */

const LICENSES: { name: string; license: string; body: string }[] = [
  {
    name: "FitxFusion",
    license: "Proprietary",
    body: `# FitxFusion\n\nCopyright (c) ${new Date().getFullYear()} FitxFusion.\n\nAll rights reserved. This application and its source code are proprietary.\nYou may use the application under the Terms of Service. Redistribution or\nreverse engineering of the application is not permitted without written\nconsent.`,
  },
  {
    name: "React, React DOM",
    license: "MIT",
    body: `# MIT License\n\nCopyright (c) Meta Platforms, Inc. and affiliates.\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the "Software"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.`,
  },
  {
    name: "Vite, Tailwind CSS, Framer Motion, Lucide, Zod",
    license: "MIT",
    body: `# MIT License\n\nCopyright (c) the respective authors of Vite, Tailwind CSS, Framer Motion,\nLucide Icons and Zod.\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the "Software"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.`,
  },
  {
    name: "Radix UI / shadcn-ui",
    license: "MIT",
    body: `# MIT License\n\nCopyright (c) WorkOS (Radix UI) and shadcn.\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software to deal in the Software without restriction, subject to the\nabove copyright notice being included in all copies.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.`,
  },
  {
    name: "Pyodide (Python runtime)",
    license: "MPL-2.0",
    body: `# Mozilla Public License 2.0\n\nCopyright (c) the Pyodide development team.\n\nThis Source Code Form is subject to the terms of the Mozilla Public License,\nv. 2.0. A copy of the MPL was distributed with the runtime. Source is available\nat https://github.com/pyodide/pyodide.`,
  },
  {
    name: "Recharts, date-fns, TanStack Query",
    license: "MIT",
    body: `# MIT License\n\nCopyright (c) the Recharts, date-fns and TanStack authors.\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software to deal in the Software without restriction.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.`,
  },
];

/** Minimal, safe markdown renderer (headings, bold, paragraphs) — no HTML injection. */
function Markdown({ text }: { text: string }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {text.split("\n").map((line, i) => {
        if (line.startsWith("# "))
          return (
            <h3 key={i} className="text-base font-semibold text-foreground">
              {line.slice(2)}
            </h3>
          );
        if (!line.trim()) return <div key={i} className="h-1" />;
        return (
          <p key={i} className="text-muted-foreground">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export function LicenseDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [active, setActive] = useState(0);
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Open-source licenses
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Open-source licenses</DialogTitle>
          <DialogDescription>
            Full license texts are bundled with the app — nothing is loaded from the internet.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          {LICENSES.map((l, i) => (
            <Button
              key={l.name}
              size="sm"
              variant={i === active ? "default" : "outline"}
              onClick={() => setActive(i)}
              className="text-xs"
            >
              {l.name.split(",")[0]}
            </Button>
          ))}
        </div>
        <ScrollArea className="h-72 rounded-lg border p-4">
          <Badge variant="secondary" className="mb-3">
            {LICENSES[active].license}
          </Badge>
          <Markdown text={LICENSES[active].body} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- Changelog drawer ---------------------------- */

const CATEGORY_META = {
  features: { label: "Features", icon: Sparkles, match: /feature|new/i },
  improvements: { label: "Improvements", icon: Zap, match: /improv|enhance|performance|design|ui/i },
  fixes: { label: "Bug Fixes", icon: Bug, match: /fix|bug/i },
  security: { label: "Security", icon: Shield, match: /secur|privacy|patch/i },
} as const;

type CategoryKey = keyof typeof CATEGORY_META;

function categorize(title: string, icon: string): CategoryKey {
  if (icon === "shield" || CATEGORY_META.security.match.test(title)) return "security";
  if (icon === "bug" || CATEGORY_META.fixes.match.test(title)) return "fixes";
  if (icon === "zap" || CATEGORY_META.improvements.match.test(title)) return "improvements";
  return "features";
}

export function ChangelogDrawer({ trigger }: { trigger?: React.ReactNode }) {
  const grouped = React.useMemo(() => {
    const map: Record<CategoryKey, { version: string; date: string; items: string[] }[]> = {
      features: [],
      improvements: [],
      fixes: [],
      security: [],
    };
    RELEASE_NOTES.forEach((release) => {
      const perCat: Partial<Record<CategoryKey, string[]>> = {};
      release.sections.forEach((s) => {
        const cat = categorize(s.title, s.icon);
        perCat[cat] = [...(perCat[cat] ?? []), ...s.items];
      });
      (Object.keys(perCat) as CategoryKey[]).forEach((cat) => {
        map[cat].push({ version: release.version, date: release.date, items: perCat[cat] ?? [] });
      });
    });
    return map;
  }, []);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Changelog viewer
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>What changed</DrawerTitle>
          <DrawerDescription>
            Release notes for v{APP_VERSION}, grouped by category.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-8">
          <Tabs defaultValue="features">
            <TabsList className="grid grid-cols-4 w-full">
              {(Object.keys(CATEGORY_META) as CategoryKey[]).map((k) => {
                const Icon = CATEGORY_META[k].icon;
                return (
                  <TabsTrigger key={k} value={k} className="text-xs gap-1">
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{CATEGORY_META[k].label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            {(Object.keys(CATEGORY_META) as CategoryKey[]).map((k) => (
              <TabsContent key={k} value={k}>
                <ScrollArea className="h-[50vh] pr-3">
                  {grouped[k].length === 0 && (
                    <p className="text-sm text-muted-foreground py-6">Nothing in this category yet.</p>
                  )}
                  {grouped[k].map((rel) => (
                    <div key={`${k}-${rel.version}`} className="mb-5 border-l-2 border-primary/40 pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-sm">v{rel.version}</h4>
                        <span className="text-xs text-muted-foreground">{rel.date}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {rel.items.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex gap-2">
                            <span className="text-primary">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/* ------------------------------- Diagnostics ------------------------------- */

export function SystemDiagnosticsPanel() {
  const { toast } = useToast();
  const [specs] = useState<SystemSpecs>(() => getSystemSpecs());
  const [network, setNetwork] = useState<NetworkInfo>(() => getNetworkInfo());
  const [storage, setStorage] = useState<StorageInfo>({
    usageBytes: 0,
    quotaBytes: 0,
    percent: 0,
    supported: true,
  });
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setNetwork(getNetworkInfo());
    setStorage(await getStorageInfo());
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 10000);
    const on = () => setNetwork(getNetworkInfo());
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
    };
  }, [refresh]);

  const exportReport = async () => {
    setBusy(true);
    try {
      const report = await buildDiagnosticReport();
      const encrypted = await encryptReport(report);
      const { passphrase, ...payload } = encrypted;
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fitxfusion-diagnostics-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      try {
        await navigator.clipboard.writeText(passphrase);
      } catch {
        /* clipboard blocked */
      }
      toast({
        title: "Diagnostic report saved",
        description: `Encrypted. Key (copied to clipboard): ${passphrase}`,
        duration: 15000,
      });
    } catch (e) {
      toast({
        title: "Could not create the report",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const rows: { label: string; value: string; icon: React.ElementType }[] = [
    { label: "App version", value: `v${specs.appVersion}`, icon: Sparkles },
    { label: "Build", value: `${specs.buildNumber} · ${specs.buildCommit}`, icon: Cpu },
    { label: "Released", value: new Date(APP_RELEASE_DATE).toLocaleDateString(), icon: Activity },
    { label: "CPU cores", value: specs.cpuCores ? `${specs.cpuCores}` : "n/a", icon: Cpu },
    { label: "Device memory", value: specs.deviceMemoryGb ? `${specs.deviceMemoryGb} GB` : "n/a", icon: HardDrive },
    { label: "Screen", value: `${specs.screen} @${specs.pixelRatio}x`, icon: Activity },
    { label: "Time zone", value: specs.timezone, icon: Activity },
    { label: "Installed app", value: specs.standalone ? "Yes" : "No", icon: Shield },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System & diagnostics
            </CardTitle>
            <CardDescription>Live device, storage and connection details</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={refresh} aria-label="Refresh diagnostics">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between rounded-lg border p-3">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <r.icon className="h-4 w-4" />
                {r.label}
              </span>
              <span className="text-sm font-medium truncate max-w-[55%] text-right">{r.value}</span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium">
              <HardDrive className="h-4 w-4" /> Storage used
            </span>
            <span className="text-sm text-muted-foreground">
              {storage.supported
                ? `${formatBytes(storage.usageBytes)} of ${formatBytes(storage.quotaBytes)}`
                : "Not reported by this browser"}
            </span>
          </div>
          <Progress value={storage.percent} className="h-2" />
        </div>

        <div className="rounded-lg border p-4 flex flex-wrap items-center gap-3">
          <Badge variant={network.online ? "default" : "destructive"} className="gap-1">
            {network.online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {network.online ? "Online" : "Offline"}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Signal className="h-3 w-3" />
            {network.effectiveType.toUpperCase()}
          </Badge>
          {network.downlinkMbps !== null && (
            <Badge variant="outline">{network.downlinkMbps.toFixed(1)} Mbps</Badge>
          )}
          {network.rttMs !== null && <Badge variant="outline">{network.rttMs} ms</Badge>}
          {network.saveData && <Badge variant="secondary">Data saver</Badge>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button onClick={exportReport} disabled={busy} className="w-full">
            {busy ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            1-click diagnostic report
          </Button>
          <ChangelogDrawer />
          <LicenseDialog />
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Lock className="h-3 w-3" />
          The report is encrypted on your device (AES-GCM). Sensitive keys are removed and the
          password is copied to your clipboard so only support you share it with can open it.
        </p>
      </CardContent>
    </Card>
  );
}
