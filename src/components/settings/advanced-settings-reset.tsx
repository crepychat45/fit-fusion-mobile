import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useSettings } from "@/contexts/safe-settings-context";
import { RESET_GROUPS, resetPatch } from "@/lib/settings-defaults";
import { RotateCcw, Loader2 } from "lucide-react";
import { ConfirmDialog } from "./confirm-dialog";

export function AdvancedSettingsReset() {
  const { restorePreferences } = useSettings();
  const [selected, setSelected] = useState<string[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const reset = async () => {
    setBusy(true);
    try {
      const ok = await restorePreferences(resetPatch(selected));
      setResult(ok ? "Selected preferences reset and saved to your account." : "Reset not saved. Check your connection and try again.");
    } finally { setBusy(false); }
  };
  return <Card className="liquid-glass">
    <CardHeader><CardTitle className="flex items-center gap-2"><RotateCcw className="h-5 w-5 text-primary" />Reset Preferences</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      {RESET_GROUPS.map(group => <label key={group.id} className="flex items-center gap-3 min-h-12 border-b border-border/40">
        <Checkbox checked={selected.includes(group.id)} disabled={busy} onCheckedChange={checked => setSelected(previous => checked ? [...previous, group.id] : previous.filter(id => id !== group.id))} />{group.label}
      </label>)}
      <Button variant="outline" onClick={() => setConfirm(true)} disabled={busy || !selected.length}>{busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-2" />}Reset selected</Button>
      {result && <p role="status" className="text-sm text-muted-foreground">{result}</p>}
    </CardContent>
    <ConfirmDialog open={confirm} onOpenChange={setConfirm} onConfirm={reset} title="Reset selected preferences?" description="Your workouts, account, app lock and other preferences stay unchanged." confirmLabel="Reset preferences" destructive />
  </Card>;
}
