import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getAllWorkouts } from "@/data/workouts";
import {
  addToSchedule,
  getSchedule,
  localDateKey,
  removeFromSchedule,
  SCHEDULE_EVENT,
} from "@/lib/schedule";
import { useWorkoutHistory } from "@/hooks/use-workout-history";
import { useEffect } from "react";
import { toast } from "sonner";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function SchedulePage() {
  const navigate = useNavigate();
  const { sessions } = useWorkoutHistory();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string>(() => localDateKey(new Date()));
  const [schedule, setSchedule] = useState(() => getSchedule());
  const [pickWorkout, setPickWorkout] = useState<string>("");
  const [pickTime, setPickTime] = useState<string>("");

  useEffect(() => {
    const refresh = () => setSchedule(getSchedule());
    window.addEventListener(SCHEDULE_EVENT, refresh);
    return () => window.removeEventListener(SCHEDULE_EVENT, refresh);
  }, []);

  const workouts = useMemo(() => getAllWorkouts(), []);
  const todayKey = localDateKey(new Date());

  const completedDays = useMemo(() => {
    const set = new Set<string>();
    for (const s of sessions) {
      if (s.status === "completed" && s.completedAt) {
        set.add(localDateKey(new Date(s.completedAt)));
      }
    }
    return set;
  }, [sessions]);

  const byDay = useMemo(() => {
    const map = new Map<string, typeof schedule>();
    for (const s of schedule) {
      const list = map.get(s.date) ?? [];
      list.push(s);
      map.set(s.date, list);
    }
    return map;
  }, [schedule]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      localDateKey(new Date(year, month, i + 1)),
    ),
  ];

  const selectedItems = byDay.get(selected) ?? [];
  const upcoming = schedule.filter((s) => s.date >= todayKey).slice(0, 10);

  const moveMonth = (delta: number) =>
    setCursor(new Date(year, month + delta, 1));

  const handleAdd = () => {
    const w = workouts.find((x) => x.id === pickWorkout);
    if (!w) {
      toast.error("Pick a workout first");
      return;
    }
    addToSchedule({
      workoutId: w.id,
      workoutTitle: w.title,
      date: selected,
      time: pickTime || undefined,
    });
    setPickWorkout("");
    setPickTime("");
    toast.success(`Scheduled "${w.title}" for ${selected}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pb-28">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workout Calendar</h1>
        <Button variant="outline" onClick={() => navigate("/workouts")}>
          Back to workouts
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <Button variant="ghost" size="icon" onClick={() => moveMonth(-1)} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle>
            {cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => moveMonth(1)} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((key, i) =>
              key === null ? (
                <div key={`empty-${i}`} />
              ) : (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`relative flex h-12 flex-col items-center justify-center rounded-lg text-sm transition-colors ${
                    key === selected
                      ? "bg-primary text-primary-foreground"
                      : key === todayKey
                        ? "border border-primary/50"
                        : "hover:bg-muted"
                  }`}
                >
                  {Number(key.slice(8))}
                  <span className="mt-0.5 flex gap-0.5">
                    {byDay.has(key) && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                    {completedDays.has(key) && (
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    )}
                  </span>
                </button>
              ),
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Blue dot = scheduled, green dot = completed that day.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {selected === todayKey ? "Today" : selected}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing scheduled for this day.
            </p>
          ) : (
            <ul className="space-y-2">
              {selectedItems.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{s.workoutTitle}</p>
                    {s.time && (
                      <p className="text-xs text-muted-foreground">{s.time}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/workout-session/${s.workoutId}`)}
                    >
                      <Play className="mr-1 h-3 w-3" /> Start
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromSchedule(s.id)}
                      aria-label="Remove from schedule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row">
            <Select value={pickWorkout} onValueChange={setPickWorkout}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choose a workout…" />
              </SelectTrigger>
              <SelectContent>
                {workouts.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.title} · {w.duration} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="time"
              value={pickTime}
              onChange={(e) => setPickTime(e.target.value)}
              className="sm:w-32"
              aria-label="Time (optional)"
            />
            <Button onClick={handleAdd}>
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {upcoming.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {upcoming.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{s.workoutTitle}</span>
                  <span className="text-muted-foreground">
                    {s.date}
                    {s.time ? ` · ${s.time}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
