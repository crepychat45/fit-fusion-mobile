import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Dumbbell, Timer, Flame, Loader2, ArrowRight } from "lucide-react";

type Exercise = {
  name: string;
  sets?: number;
  reps?: string;
  rest?: string;
  duration?: string;
  instructions?: string;
  muscle_groups?: string[];
};

type Workout = {
  name: string;
  summary: string;
  duration_minutes: number;
  difficulty: string;
  focus: string;
  warmup: Exercise[];
  exercises: Exercise[];
  cooldown: Exercise[];
  tips: string[];
  estimated_calories: number;
};

const FAQS = [
  {
    q: "Is the AI workout generator free?",
    a: "Yes. Our AI workout generator is completely free and does not require an account. Sign up for a free FitFusion profile to save plans and track progress.",
  },
  {
    q: "How does the AI workout planner build a routine?",
    a: "It uses your goal, focus area, duration, available equipment, and fitness level to generate a personalized warmup, workout, and cooldown with sets, reps, rest, and coaching cues.",
  },
  {
    q: "Can I use it with no equipment?",
    a: "Yes. Choose 'None' or 'Bodyweight' and the AI will design a routine you can do anywhere.",
  },
  {
    q: "Is it safe for beginners?",
    a: "Absolutely. Select the 'Beginner' level to receive lower-intensity movements, longer rest, and clear form instructions.",
  },
];

const AIWorkoutGenerator: React.FC = () => {
  const [goal, setGoal] = useState("build lean muscle");
  const [focus, setFocus] = useState("full body");
  const [duration, setDuration] = useState(30);
  const [equipment, setEquipment] = useState("bodyweight");
  const [level, setLevel] = useState("beginner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workout, setWorkout] = useState<Workout | null>(null);

  React.useEffect(() => {
    document.title = "AI Workout Generator — Free Personalized Plans | FitFusion";
    const desc =
      "Free AI workout generator: get a personalized workout plan in seconds. Choose your goal, equipment, and level — the AI workout planner builds warmup, sets, reps, and cooldown.";
    let m = document.querySelector('meta[name="description"]');
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute("name", "description");
      document.head.appendChild(m);
    }
    m.setAttribute("content", desc);

    // FAQ + SoftwareApplication JSON-LD
    const existing = document.querySelectorAll('script[data-seo="ai-workout-generator"]');
    existing.forEach((n) => n.remove());
    const faqLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };
    const appLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "FitFusion AI Workout Generator",
      applicationCategory: "HealthApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: desc,
    };
    for (const data of [faqLd, appLd]) {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.setAttribute("data-seo", "ai-workout-generator");
      s.textContent = JSON.stringify(data);
      document.head.appendChild(s);
    }
  }, []);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setWorkout(null);
    try {
      const { data, error } = await supabase.functions.invoke("public-ai-workout-generator", {
        body: { goal, focus, duration, equipment, level },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setWorkout((data as any).workout as Workout);
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <header className="border-b border-white/5 backdrop-blur-md sticky top-0 z-10 bg-background/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg">FitFusion</Link>
          <div className="flex items-center gap-2">
            <Link to="/auth"><Button size="sm" variant="ghost">Sign in</Button></Link>
            <Link to="/auth"><Button size="sm">Get the app</Button></Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-12">
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs">
            <Sparkles className="w-3 h-3" /> Free · No signup required
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            AI Workout Generator
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Build a personalized workout in seconds. Our free AI workout planner creates a warmup, main routine,
            and cooldown tailored to your goal, equipment, and fitness level.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <Card className="backdrop-blur-md bg-card/60 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Dumbbell className="w-5 h-5" /> Design your workout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="goal">Your goal</Label>
                <Textarea
                  id="goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. build lean muscle, lose fat, improve endurance"
                  maxLength={200}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Focus</Label>
                  <Select value={focus} onValueChange={setFocus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full body">Full body</SelectItem>
                      <SelectItem value="upper body">Upper body</SelectItem>
                      <SelectItem value="lower body">Lower body</SelectItem>
                      <SelectItem value="core">Core / abs</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                      <SelectItem value="pull">Pull</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Level</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={5}
                    max={120}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value) || 30)}
                  />
                </div>
                <div>
                  <Label>Equipment</Label>
                  <Select value={equipment} onValueChange={setEquipment}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bodyweight">Bodyweight only</SelectItem>
                      <SelectItem value="dumbbells">Dumbbells</SelectItem>
                      <SelectItem value="barbell">Barbell</SelectItem>
                      <SelectItem value="kettlebell">Kettlebell</SelectItem>
                      <SelectItem value="resistance bands">Resistance bands</SelectItem>
                      <SelectItem value="full gym">Full gym</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={generate} disabled={loading || !goal.trim()} className="w-full" size="lg">
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Generate my workout</>
                )}
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-card/60 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Flame className="w-5 h-5" /> Your AI workout</CardTitle>
            </CardHeader>
            <CardContent>
              {!workout && !loading && (
                <div className="text-muted-foreground text-sm">
                  Your personalized plan will appear here. Try "build lean muscle at home" or "30-minute fat burn".
                </div>
              )}
              {loading && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Coach FitX is designing your routine…
                </div>
              )}
              {workout && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold">{workout.name}</h2>
                    <p className="text-sm text-muted-foreground">{workout.summary}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Timer className="w-3 h-3" />{workout.duration_minutes} min</span>
                      <span>Focus: {workout.focus}</span>
                      <span>Level: {workout.difficulty}</span>
                      <span>~{workout.estimated_calories} kcal</span>
                    </div>
                  </div>
                  <Section title="Warmup" items={workout.warmup} />
                  <Section title="Main workout" items={workout.exercises} main />
                  <Section title="Cooldown" items={workout.cooldown} />
                  {workout.tips?.length ? (
                    <div>
                      <h3 className="font-semibold mb-1">Coach tips</h3>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {workout.tips.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>
                  ) : null}
                  <Link to="/auth" className="block">
                    <Button className="w-full" size="lg">
                      Save plans & track progress — Free <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">How the AI workout planner works</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { t: "1. Tell us your goal", d: "Muscle, fat loss, endurance, mobility — describe it in your own words." },
              { t: "2. Pick constraints", d: "Duration, equipment, and level shape the routine to your life." },
              { t: "3. Get a personalized plan", d: "AI-generated warmup, sets, reps, rest, and coaching cues." },
            ].map((s) => (
              <Card key={s.t} className="bg-card/60 border-white/10">
                <CardHeader><CardTitle className="text-base">{s.t}</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">{s.d}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <Card key={f.q} className="bg-card/60 border-white/10">
                <CardHeader><CardTitle className="text-base">{f.q}</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">{f.a}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="text-center py-10">
          <h2 className="text-2xl font-bold mb-2">Level up with FitFusion</h2>
          <p className="text-muted-foreground mb-4">
            Save plans, track streaks, log PRs, and unlock adaptive AI coaching.
          </p>
          <Link to="/auth"><Button size="lg">Create your free account</Button></Link>
        </section>
      </main>
    </div>
  );
};

const Section: React.FC<{ title: string; items: Exercise[]; main?: boolean }> = ({ title, items, main }) => {
  if (!items?.length) return null;
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <ul className="space-y-2">
        {items.map((ex, i) => (
          <li key={i} className="rounded-lg border border-white/10 bg-background/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{ex.name}</span>
              <span className="text-xs text-muted-foreground">
                {main
                  ? `${ex.sets ?? "-"} × ${ex.reps ?? "-"} · rest ${ex.rest ?? "-"}`
                  : ex.duration}
              </span>
            </div>
            {ex.instructions && <p className="text-xs text-muted-foreground mt-1">{ex.instructions}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AIWorkoutGenerator;
