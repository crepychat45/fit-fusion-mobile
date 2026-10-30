import { useRef, useState } from "react";
import { APP_VERSION } from "@/lib/app-version";
import { safeJsonParse, readJson, writeJson } from "@/lib/safe-storage";
import { validSettingsBackup } from "@/lib/settings-defaults";
import { useSettings } from "@/contexts/safe-settings-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, HardDrive, Trash2, RotateCcw } from "lucide-react";
import { ConfirmDialog } from "./confirm-dialog";

type Backup = { id: string; at: string; version: string; preferences: ReturnType<typeof useSettings>["settingsSnapshot"] };
const KEY = "fitfusion-settings-backups-v2";

export function SettingsBackupRestore() {
  const { settingsSnapshot, restorePreferences } = useSettings();
  const [backups, setBackups] = useState<Backup[]>(() => {
    const stored = readJson<unknown>(KEY, []);
    return Array.isArray(stored) ? stored.filter(b => validSettingsBackup(b) && 'id' in b && typeof b.id === "string") as Backup[] : [];
  });
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [restore, setRestore] = useState<unknown>(null);
  const file = useRef<HTMLInputElement>(null);
  const persist = (next: Backup[]) => {
    if (!writeJson(KEY, next)) { setResult("Device storage unavailable. Backup not saved."); return false; }
    setBackups(next); return true;
  };
  const create = () => {
    const backup = { id: crypto.randomUUID(), at: new Date().toISOString(), version: APP_VERSION, preferences: settingsSnapshot };
    if (persist([backup, ...backups].slice(0, 10))) setResult("Preferences backed up on this device.");
  };
  const download = (backup: Backup) => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = `fitfusion-settings-${backup.at.slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url);
  };
  const apply = async () => {
    if (!validSettingsBackup(restore)) { setResult("Invalid backup. Nothing changed."); return; }
    setBusy(true);
    try {
      setResult(await restorePreferences(restore.preferences) ? "Preferences restored and saved to your account." : "Restore not saved. Check your connection and retry.");
    } finally { setBusy(false); setRestore(null); }
  };
  return <Card className="liquid-glass">
    <CardHeader><CardTitle className="flex items-center gap-2"><HardDrive className="h-5 w-5 text-primary" />Preferences Backup & Restore</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <div className="flex flex-wrap gap-2"><Button onClick={create} disabled={busy}><Download className="h-4 w-4 mr-2" />Create backup</Button><Button variant="outline" onClick={() => file.current?.click()} disabled={busy}><Upload className="h-4 w-4 mr-2" />Import backup</Button></div>
      <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={async event => {
        const upload = event.target.files?.[0]; event.target.value = "";
        if (!upload) return;
        if (upload.size > 1048576) { setResult("Backup must be smaller than 1 MB."); return; }
        const parsed = safeJsonParse<unknown>(await upload.text(), null);
        if (!validSettingsBackup(parsed)) { setResult("Invalid preferences backup. Nothing changed."); return; }
        setRestore(parsed);
      }} />
      {!backups.length && <p className="text-sm text-muted-foreground">No preference backups on this device.</p>}
      {backups.map(backup => <div key={backup.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 py-3">
        <p className="text-sm">{new Date(backup.at).toLocaleString()} <span className="text-muted-foreground">v{backup.version}</span></p>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" aria-label="Download backup" title="Download backup" onClick={() => download(backup)}><Download className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" aria-label="Restore backup" title="Restore backup" disabled={busy} onClick={() => setRestore(backup)}><RotateCcw className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" aria-label="Delete backup" title="Delete backup" disabled={busy} onClick={() => persist(backups.filter(b => b.id !== backup.id))}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>)}
      {result && <p role="status" className="text-sm text-muted-foreground">{result}</p>}
    </CardContent>
    <ConfirmDialog open={restore !== null} onOpenChange={open => { if (!open) setRestore(null); }} onConfirm={apply} title="Restore preferences?" description="Replaces shared app preferences. Workouts, passwords and device permissions are not included." confirmLabel="Restore" />
  </Card>;
}
