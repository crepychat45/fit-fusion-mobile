import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { HelpCircle, ShieldCheck, Trash2 } from "lucide-react";
import { RECOVERY_QUESTIONS, clearRecovery, readRecovery, saveRecovery } from "@/lib/app-lock";

/**
 * Lets the user configure two security questions so a forgotten App Lock
 * PIN can be reset offline — no email round-trip required.
 * Answers are stored only as SHA-256 digests.
 */
export function RecoveryQuestionsCard() {
  const { toast } = useToast();
  const existing = useMemo(() => readRecovery(), []);
  const [configured, setConfigured] = useState(existing.length >= 2);
  const [q1, setQ1] = useState(existing[0]?.question ?? RECOVERY_QUESTIONS[0]);
  const [q2, setQ2] = useState(existing[1]?.question ?? RECOVERY_QUESTIONS[1]);
  const [a1, setA1] = useState("");
  const [a2, setA2] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (q1 === q2) {
      toast({ title: "Pick two different questions", variant: "destructive" });
      return;
    }
    if (a1.trim().length < 2 || a2.trim().length < 2) {
      toast({ title: "Answers are too short", description: "Use at least 2 characters.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await saveRecovery([
        { question: q1, answer: a1 },
        { question: q2, answer: a2 },
      ]);
      setA1("");
      setA2("");
      setConfigured(true);
      toast({ title: "Recovery questions saved", description: "You can now reset your PIN from the lock screen." });
    } finally {
      setBusy(false);
    }
  };

  const remove = () => {
    clearRecovery();
    setConfigured(false);
    toast({ title: "Recovery questions removed" });
  };

  return (
    <Card className="border-border/40 bg-card/70 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <HelpCircle className="h-4 w-4 text-primary" />
          PIN Recovery Questions
          <Badge variant="outline" className={`ml-auto text-[10px] ${configured ? "border-emerald-500/40 text-emerald-600" : ""}`}>
            {configured ? "Active" : "Not set"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Reset a forgotten App Lock PIN instantly by answering two private questions.
          Answers are hashed on this device and never sent anywhere.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[{ q: q1, setQ: setQ1, a: a1, setA: setA1, n: 1 }, { q: q2, setQ: setQ2, a: a2, setA: setA2, n: 2 }].map((row) => (
          <div key={row.n} className="space-y-2 rounded-xl border border-border/40 p-3">
            <Label className="text-sm">Question {row.n}</Label>
            <Select value={row.q} onValueChange={row.setQ}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {RECOVERY_QUESTIONS.map((q) => (
                  <SelectItem key={q} value={q}>{q}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="password"
              autoComplete="off"
              value={row.a}
              onChange={(e) => row.setA(e.target.value)}
              placeholder={configured ? "Enter a new answer to replace" : "Your answer"}
            />
          </div>
        ))}

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void save()} disabled={busy}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            {configured ? "Update answers" : "Save recovery questions"}
          </Button>
          {configured && (
            <Button variant="outline" onClick={remove}>
              <Trash2 className="mr-2 h-4 w-4" /> Remove
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default RecoveryQuestionsCard;
