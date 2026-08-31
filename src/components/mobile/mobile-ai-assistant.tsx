import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Brain,
  Mic,
  Send,
  Sparkles,
  Zap,
  Heart,
  Volume2,
  VolumeX,
  Bot,
  User,
  Square,
  RefreshCw,
  Copy,
  Trash2,
  Gauge,
  Apple,
  Dumbbell,
  Moon,
  X,
} from "lucide-react";

/* ─────────────────────────── types ─────────────────────────── */

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
  ms?: number;
}

interface MobileAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

type Model = "google/gemini-3-flash-preview" | "google/gemini-3-pro-preview";
type Coach = "balanced" | "strength" | "nutrition" | "recovery";

const STORAGE_KEY = "fitfusion-mobile-coach-history";
const PREFS_KEY = "fitfusion-mobile-coach-prefs";

const COACH_PRESETS: Record<Coach, { label: string; icon: React.ElementType; primer: string }> = {
  balanced: {
    label: "Balanced",
    icon: Sparkles,
    primer: "Act as a well-rounded fitness coach covering training, nutrition and recovery.",
  },
  strength: {
    label: "Strength",
    icon: Dumbbell,
    primer:
      "Act as a strength & hypertrophy coach. Prioritise progressive overload, sets/reps/RPE prescriptions and technique cues.",
  },
  nutrition: {
    label: "Nutrition",
    icon: Apple,
    primer:
      "Act as a sports nutritionist. Give macro targets, meal timing and practical food swaps with approximate calories.",
  },
  recovery: {
    label: "Recovery",
    icon: Moon,
    primer:
      "Act as a recovery and sleep specialist. Focus on mobility, deload strategy, sleep hygiene and stress management.",
  },
};

const QUICK_PROMPTS = [
  "Build me a 20-minute full-body workout with no equipment",
  "How much protein should I eat to build muscle?",
  "My lower back hurts after deadlifts — what should I fix?",
  "Plan my training week around 4 gym days",
  "Give me a 5-minute mobility routine for tight hips",
  "How do I break through a bench press plateau?",
];

/* ─────────────────────────── helpers ─────────────────────────── */

function loadHistory(): Message[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (Array.isArray(raw)) return raw.slice(-60);
  } catch {
    /* ignore */
  }
  return [];
}

function loadPrefs(): { model: Model; coach: Coach; speak: boolean } {
  try {
    const raw = JSON.parse(localStorage.getItem(PREFS_KEY) || "null");
    if (raw && typeof raw === "object") {
      return {
        model: raw.model === "google/gemini-3-pro-preview" ? raw.model : "google/gemini-3-flash-preview",
        coach: (["balanced", "strength", "nutrition", "recovery"].includes(raw.coach) ? raw.coach : "balanced") as Coach,
        speak: raw.speak === true,
      };
    }
  } catch {
    /* ignore */
  }
  return { model: "google/gemini-3-flash-preview", coach: "balanced", speak: false };
}

const stripForSpeech = (t: string) =>
  t
    .replace(/[*_`#>]/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .slice(0, 600);

/* ─────────────────────────── component ─────────────────────────── */

export function MobileAIAssistant({ isOpen, onClose }: MobileAIAssistantProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(loadHistory);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [listening, setListening] = useState(false);
  const [prefs, setPrefs] = useState(loadPrefs);
  const [latency, setLatency] = useState<number | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  /* persistence */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-60)));
    } catch {
      /* ignore */
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }, [prefs]);

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  /* stop everything when the sheet closes */
  useEffect(() => {
    if (isOpen) return;
    abortRef.current?.abort();
    try {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
  }, [isOpen]);

  const speak = useCallback(
    (text: string) => {
      if (!prefs.speak || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(stripForSpeech(text));
        u.rate = 1.02;
        u.pitch = 1.05;
        window.speechSynthesis.speak(u);
      } catch {
        /* ignore */
      }
    },
    [prefs.speak],
  );

  /* ── core: real streaming request to the Gemini-backed edge function ── */
  const ask = useCallback(
    async (text: string, history?: Message[]) => {
      const question = text.trim();
      if (!question || streaming) return;

      const base = history ?? messages;
      const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: question, ts: Date.now() };
      const nextMessages = [...base, userMsg];
      setMessages(nextMessages);
      setInput("");
      setStreaming(true);

      const started = performance.now();
      const controller = new AbortController();
      abortRef.current = controller;
      const assistantId = `a-${Date.now()}`;

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) throw new Error("Please sign in to use the AI Coach.");

        const payload = [
          { role: "system", content: COACH_PRESETS[prefs.coach].primer },
          ...nextMessages.slice(-16).map((m) => ({ role: m.role, content: m.content })),
        ];

        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fitfusion-chat`, {
          method: "POST",
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: payload,
            model: prefs.model,
            language: (typeof navigator !== "undefined" ? navigator.language : "en") || "en",
          }),
        });

        if (!res.ok || !res.body) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "The AI Coach is unavailable right now.");
        }

        setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "", ts: Date.now() }]);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let answer = "";
        let firstToken = 0;

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const delta = JSON.parse(data)?.choices?.[0]?.delta?.content;
              if (typeof delta === "string" && delta) {
                if (!firstToken) {
                  firstToken = performance.now() - started;
                  setLatency(Math.round(firstToken));
                }
                answer += delta;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, content: answer } : m)),
                );
              }
            } catch {
              /* partial JSON chunk */
            }
          }
        }

        if (!answer) throw new Error("Empty response from the AI Coach.");
        const total = Math.round(performance.now() - started);
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, ms: total } : m)));
        speak(answer);
      } catch (err: any) {
        if (err?.name === "AbortError") {
          setMessages((prev) => prev.filter((m) => m.id !== assistantId || m.content.length > 0));
        } else {
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          toast({
            title: "AI Coach error",
            description: err?.message || "Please check your connection and try again.",
            variant: "destructive",
          });
        }
      } finally {
        abortRef.current = null;
        setStreaming(false);
      }
    },
    [messages, prefs.coach, prefs.model, speak, streaming, toast],
  );

  const stop = () => {
    abortRef.current?.abort();
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
  };

  const regenerate = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    const idx = messages.lastIndexOf(lastUser);
    void ask(lastUser.content, messages.slice(0, idx));
  };

  const clearChat = () => {
    stop();
    setMessages([]);
    setLatency(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  /* voice input */
  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast({ title: "Voice not supported", description: "This device has no speech recognition.", variant: "destructive" });
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    recognitionRef.current = rec;
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = navigator.language || "en-US";
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join(" ");
      setInput(transcript);
      if (e.results[e.results.length - 1].isFinal) {
        setListening(false);
        void ask(transcript);
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  };

  const modelLabel = prefs.model.includes("pro") ? "Gemini 3 Pro" : "Gemini 3 Flash";
  const showQuick = useMemo(() => messages.length === 0, [messages.length]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 flex h-[92vh] flex-col rounded-t-3xl border border-border/40 bg-card shadow-2xl"
            role="dialog"
            aria-label="Mobile AI Coach"
          >
            {/* Header */}
            <div className="rounded-t-3xl border-b border-border/40 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-primary/15 p-2">
                    <Brain className="h-5 w-5 text-primary" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold leading-tight">Mobile AI Coach</h3>
                    <p className="text-xs text-muted-foreground">
                      {modelLabel} • real-time streaming
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {latency !== null && (
                    <Badge variant="outline" className="hidden text-[10px] sm:inline-flex">
                      <Gauge className="mr-1 h-3 w-3" />
                      {latency} ms
                    </Badge>
                  )}
                  <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close AI coach">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-full text-xs"
                  onClick={() =>
                    setPrefs((p) => ({
                      ...p,
                      model:
                        p.model === "google/gemini-3-flash-preview"
                          ? "google/gemini-3-pro-preview"
                          : "google/gemini-3-flash-preview",
                    }))
                  }
                >
                  <Zap className="mr-1 h-3 w-3" />
                  {prefs.model.includes("pro") ? "Pro (deep)" : "Flash (fast)"}
                </Button>
                <Button
                  size="sm"
                  variant={prefs.speak ? "default" : "outline"}
                  className="h-8 rounded-full text-xs"
                  onClick={() => {
                    if (prefs.speak) window.speechSynthesis?.cancel();
                    setPrefs((p) => ({ ...p, speak: !p.speak }));
                  }}
                >
                  {prefs.speak ? <Volume2 className="mr-1 h-3 w-3" /> : <VolumeX className="mr-1 h-3 w-3" />}
                  Voice
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-full text-xs"
                  onClick={regenerate}
                  disabled={streaming || !messages.some((m) => m.role === "user")}
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Retry
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-full text-xs"
                  onClick={clearChat}
                  disabled={messages.length === 0}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Clear
                </Button>
              </div>

              {/* Coach persona */}
              <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5">
                {(Object.keys(COACH_PRESETS) as Coach[]).map((key) => {
                  const Icon = COACH_PRESETS[key].icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPrefs((p) => ({ ...p, coach: key }))}
                      className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors ${
                        prefs.coach === key
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border/50 text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {COACH_PRESETS[key].label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {showQuick && (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-border/40 bg-muted/40 p-4 text-sm">
                    <p className="font-medium">Hi! I'm your real-time AI fitness coach.</p>
                    <p className="mt-1 text-muted-foreground">
                      Ask anything about training, nutrition, recovery or motivation — answers stream instantly.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    {QUICK_PROMPTS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => void ask(q)}
                        className="rounded-xl border border-border/40 bg-card px-3 py-2 text-left text-xs hover:border-primary/50 hover:bg-primary/5"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <span className="mt-1 h-7 w-7 shrink-0 rounded-full bg-primary/15 p-1.5">
                      <Bot className="h-4 w-4 text-primary" />
                    </span>
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border/40 bg-muted/50"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {m.content}
                      {streaming && m.role === "assistant" && m.id === messages[messages.length - 1]?.id && (
                        <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-primary align-middle" />
                      )}
                    </p>
                    {m.role === "assistant" && !!m.content && (
                      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                        {m.ms ? <span>{(m.ms / 1000).toFixed(1)}s</span> : null}
                        <button type="button" className="inline-flex items-center gap-1" onClick={() => copy(m.content)}>
                          <Copy className="h-3 w-3" /> Copy
                        </button>
                      </div>
                    )}
                  </div>
                  {m.role === "user" && (
                    <span className="mt-1 h-7 w-7 shrink-0 rounded-full bg-accent/20 p-1.5">
                      <User className="h-4 w-4 text-accent-foreground" />
                    </span>
                  )}
                </div>
              ))}

              {streaming && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Heart className="h-3 w-3 animate-pulse text-primary" /> Coach is thinking…
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Composer */}
            <div className="border-t border-border/40 bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="flex items-end gap-2">
                <Button
                  variant={listening ? "default" : "outline"}
                  size="icon"
                  className="h-11 w-11 shrink-0 rounded-xl"
                  onClick={toggleVoice}
                  aria-label="Voice input"
                >
                  <Mic className={`h-4 w-4 ${listening ? "animate-pulse" : ""}`} />
                </Button>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void ask(input);
                    }
                  }}
                  placeholder="Ask your coach anything…"
                  rows={1}
                  className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl text-sm"
                />
                {streaming ? (
                  <Button size="icon" variant="destructive" className="h-11 w-11 shrink-0 rounded-xl" onClick={stop} aria-label="Stop">
                    <Square className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    className="h-11 w-11 shrink-0 rounded-xl"
                    onClick={() => void ask(input)}
                    disabled={!input.trim()}
                    aria-label="Send"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MobileAIAssistant;
