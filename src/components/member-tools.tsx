import { useMemo, useState } from "react";
import { Download, Search, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkoutHistory } from "@/hooks/use-workout-history";
import { filterMemberHistory, memberCsv, memberReview, type MemberHistorySort } from "@/lib/member-analytics";
import { hasMemberTool, type PlanId } from "@/lib/premium-access";

export function MemberTools({ plan, userId }: { plan: PlanId; userId: string }) {
  const { sessions } = useWorkoutHistory();
  const [days, setDays] = useState(30);
  const [search, setSearch] = useState("");
  const [goal, setGoal] = useState(4);
  const [duration, setDuration] = useState<"all" | "short" | "long">("all");
  const [sort, setSort] = useState<MemberHistorySort>("newest");
  const [expanded, setExpanded] = useState<string | null>(null);
  const allowedRanges = hasMemberTool(plan, "annualRange") ? [7, 30, 90, 180, 365] : hasMemberTool(plan, "extendedRange") ? [7, 30, 90, 180] : [7, 30, 90];
  const effectiveDays = allowedRanges.includes(days) ? days : 30;
  const review = useMemo(() => memberReview(sessions.filter(s => s.userId === userId), effectiveDays), [sessions, userId, effectiveDays]);
  const matching = useMemo(() => filterMemberHistory(review.sessions, search, duration, sort), [review.sessions, search, duration, sort]);
  const download = (format: "csv" | "json") => {
    const content = format === "csv" ? memberCsv(matching) : JSON.stringify({ source: "Recorded account workouts on this device", days: effectiveDays, filters: { search, duration, sort }, sessions: matching }, null, 2);
    const url = URL.createObjectURL(new Blob([content], { type: format === "csv" ? "text/csv;charset=utf-8" : "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = `fitxfusion-training-${effectiveDays}d.${format}`; a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <section className="space-y-6 py-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-xl font-semibold">Member training studio</h2><p className="text-sm text-muted-foreground">Your recorded account workouts on this device</p></div>
      <div className="flex gap-2">
        {hasMemberTool(plan, "csvReport") && <Button variant="outline" size="sm" onClick={() => download("csv")} disabled={!matching.length}><Download className="mr-2 h-4 w-4" />CSV</Button>}
        {hasMemberTool(plan, "jsonReport") && <Button variant="outline" size="sm" onClick={() => download("json")} disabled={!matching.length}><Download className="mr-2 h-4 w-4" />JSON</Button>}
      </div>
    </div>
    <Tabs value={String(effectiveDays)} onValueChange={v => setDays(Number(v))}><TabsList className="flex h-auto flex-wrap justify-start">{allowedRanges.map(n => <TabsTrigger key={n} value={String(n)}>{n} days</TabsTrigger>)}</TabsList></Tabs>
    <dl className="grid grid-cols-2 gap-4 border-y border-border py-5 sm:grid-cols-5">
      {[['Sessions', review.sessions.length], ['Training minutes', review.minutes], ['Active days', review.activeDays], ['Average minutes', review.averageMinutes], ['Longest minutes', review.longestMinutes]].map(([label, value]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-2xl font-semibold">{value}</dd></div>)}
    </dl>
    {hasMemberTool(plan, "periodComparison") && <div><h3 className="font-semibold">Previous {effectiveDays} days</h3><p className="text-sm text-muted-foreground">{review.previousCount} sessions · {review.previousMinutes} minutes</p><p className="mt-1 text-sm">Change: {review.sessions.length - review.previousCount > 0 ? '+' : ''}{review.sessions.length - review.previousCount} sessions · {review.minutes - review.previousMinutes > 0 ? '+' : ''}{review.minutes - review.previousMinutes} minutes</p></div>}
    {hasMemberTool(plan, "weekdayAnalysis") && <div><h3 className="mb-3 font-semibold">Training by day of week</h3><dl className="grid grid-cols-4 gap-3 sm:grid-cols-7">{review.weekdays.map(entry => <div key={entry.day} className="border-b-2 border-primary/30 py-3"><dt className="text-xs text-muted-foreground">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][entry.day]}</dt><dd className="mt-1 font-semibold">{entry.sessions}<span className="block text-xs font-normal text-muted-foreground">{Math.round(entry.seconds / 60)} min</span></dd></div>)}</dl></div>}
    {hasMemberTool(plan, "weeklyTarget") && <div className="flex flex-wrap items-end gap-4"><div><Label htmlFor="member-weekly-goal">This week’s session target</Label><Input id="member-weekly-goal" className="mt-2 w-24" type="number" min={1} max={14} value={goal} onChange={e => setGoal(Math.min(14, Math.max(1, Number(e.target.value) || 1)))} /></div><p className="pb-2 text-sm">{review.thisWeek} completed · {Math.max(0, goal - review.thisWeek)} remaining</p></div>}
    <div><h3 className="mb-3 font-semibold">Workout variety</h3>{review.mix.length ? <ul className="divide-y divide-border">{review.mix.map(m => <li key={m.title} className="flex justify-between gap-3 py-3 text-sm"><span className="min-w-0 break-words">{m.title}</span><span className="shrink-0 text-muted-foreground">{m.count} sessions · {Math.round(m.seconds / 60)} min</span></li>)}</ul> : <p className="text-sm text-muted-foreground">No completed workouts in this period.</p>}</div>
    {hasMemberTool(plan, "recordTimeline") && <div><h3 className="mb-3 flex items-center gap-2 font-semibold"><Trophy className="h-4 w-4 text-primary" />Duration personal bests in this period</h3>{review.timeline.length ? <ul className="space-y-2">{review.timeline.map(r => <li key={r.id} className="text-sm">{new Date(r.date).toLocaleDateString()} · {r.minutes} minutes · {r.title}</li>)}</ul> : <p className="text-sm text-muted-foreground">No new duration records in this period.</p>}</div>}
    <div className="space-y-3"><Label htmlFor="member-history">Search member history</Label><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="member-history" className="pl-9" placeholder="Workout or notes" value={search} onChange={e => setSearch(e.target.value)} /></div>
      {hasMemberTool(plan, "historyFilters") && <div className="grid gap-3 sm:grid-cols-2"><Select value={duration} onValueChange={v => { if (v === "all" || v === "short" || v === "long") setDuration(v); }}><SelectTrigger aria-label="Session duration"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All durations</SelectItem><SelectItem value="short">Under 30 minutes</SelectItem><SelectItem value="long">30 minutes or more</SelectItem></SelectContent></Select><Select value={sort} onValueChange={v => { if (v === "newest" || v === "oldest" || v === "longest") setSort(v); }}><SelectTrigger aria-label="History order"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="newest">Newest first</SelectItem><SelectItem value="oldest">Oldest first</SelectItem><SelectItem value="longest">Longest first</SelectItem></SelectContent></Select></div>}
      <div className="flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground">{matching.length} matching sessions</p>{(search || duration !== "all" || sort !== "newest") && <Button size="sm" variant="ghost" onClick={() => { setSearch(""); setDuration("all"); setSort("newest"); }}>Clear filters</Button>}</div>
      <ul className="max-h-96 divide-y divide-border overflow-auto">{matching.map(s => <li key={s.id} className="py-3 text-sm"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><span className="break-words font-medium">{s.workoutTitle}</span><p className="text-xs text-muted-foreground">{new Date(s.completedAt).toLocaleString()} · {Math.round(s.durationSec / 60)} min</p></div><Button variant="ghost" size="sm" aria-expanded={expanded === s.id} onClick={() => setExpanded(expanded === s.id ? null : s.id)}>{expanded === s.id ? "Hide" : "Details"}</Button></div>{expanded === s.id && <div className="mt-3 space-y-2 border-l-2 border-primary/30 pl-3"><p>{s.exercisesCompleted.length} of {s.totalExercises} exercises completed</p><p className="text-xs text-muted-foreground">Started {new Date(s.startedAt).toLocaleString()}</p>{s.notes && <p className="break-words">{s.notes}</p>}</div>}</li>)}</ul>{!matching.length && <p className="text-sm text-muted-foreground">No matching completed sessions.</p>}</div>
  </section>;
}