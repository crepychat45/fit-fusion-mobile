import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Brain, Send, Mic, MicOff, Bot, User as UserIcon, Sparkles, Shield,
  Trash2, Copy, Check, Download, StopCircle, Zap, Activity, Dumbbell, Apple, HeartPulse, Flame,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

interface AIEnhancedChatProps {
  user?: any;
  onClose?: () => void;
}

const MODELS = [
  { id: "google/gemini-3-flash-preview", name: "Gemini 3 Flash", desc: "Fast", icon: Zap },
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", desc: "Balanced", icon: Activity },
  { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro", desc: "Strongest", icon: Brain },
];

const QUICK_PROMPTS = [
  { label: "30-min HIIT", icon: Flame, text: "Build me a 30-minute HIIT workout I can do at home with no equipment." },
  { label: "Meal plan", icon: Apple, text: "Suggest a 1-day high-protein meal plan around 2000 kcal." },
  { label: "Form check", icon: Dumbbell, text: "Explain proper barbell squat form with the top 5 mistakes to avoid." },
  { label: "Recovery", icon: HeartPulse, text: "Give me a 15-minute recovery + mobility routine for after leg day." },
];

const STORAGE_KEY = (uid?: string) => `fitfusion-ai-chat-${uid || "anon"}`;

function useLocalMessages(uid?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY(uid));
      if (raw) setMessages(JSON.parse(raw));
    } catch {}
  }, [uid]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY(uid), JSON.stringify(messages.slice(-100)));
    } catch {}
  }, [messages, uid]);
  return [messages, setMessages] as const;
}

export function AIEnhancedChat({ user }: AIEnhancedChatProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useLocalMessages(user?.id);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [model, setModel] = useState(MODELS[0].id);
  const [isRecording, setIsRecording] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };
    const assistantId = `a-${Date.now()}`;
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "", timestamp: Date.now() }]);
    setInput("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not signed in");

      const url = `${(import.meta as any).env.VITE_SUPABASE_URL}/functions/v1/fitfusion-chat`;
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages: history, model }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        if (resp.status === 429) {
          toast({ title: "Rate limited", description: "Please try again shortly.", variant: "destructive" });
        } else if (resp.status === 402) {
          toast({ title: "AI credits exhausted", description: "Add workspace credits to continue.", variant: "destructive" });
        } else {
          toast({ title: "AI error", description: err.error || "Failed to generate reply", variant: "destructive" });
        }
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta.length > 0) {
              accumulated += delta;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m)),
              );
            }
          } catch {}
        }
      }
    } catch (e: any) {
      if (e?.name === "AbortError") {
        toast({ title: "Stopped", description: "Response generation stopped." });
      } else {
        console.error("AI chat error", e);
        toast({ title: "Connection error", description: e?.message || "Failed to reach AI", variant: "destructive" });
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [messages, model, isStreaming, setMessages, toast]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleClear = useCallback(() => {
    setMessages([]);
    toast({ title: "Chat cleared", description: "Conversation history reset." });
  }, [setMessages, toast]);

  const handleCopy = useCallback(async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  }, [toast]);

  const handleExport = useCallback(() => {
    const md = messages
      .map((m) => `### ${m.role === "user" ? "You" : "FitX AI"} — ${new Date(m.timestamp).toLocaleString()}\n\n${m.content}`)
      .join("\n\n---\n\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitfusion-chat-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [messages]);

  const handleVoice = useCallback(async () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast({ title: "Voice not supported", description: "This browser doesn't support speech recognition.", variant: "destructive" });
      return;
    }
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    const rec = new SR();
    rec.lang = navigator.language || "en-US";
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + text : text));
    };
    rec.onend = () => setIsRecording(false);
    rec.onerror = () => setIsRecording(false);
    rec.start();
    setIsRecording(true);
  }, [isRecording, toast]);

  const showWelcome = messages.length === 0;

  return (
    <div className="flex flex-col h-full min-h-[520px] max-h-[calc(100vh-220px)] bg-card/60 backdrop-blur-xl rounded-2xl border border-border/20 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border/20 bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-primary/15 rounded-lg shrink-0">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate">FitX AI Coach</h3>
            <p className="text-[10px] text-muted-foreground truncate">Live • Lovable AI Gateway</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="text-[10px] bg-background/50 border border-border/30 rounded px-1.5 py-1 max-w-[110px]"
            disabled={isStreaming}
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <Button size="icon" variant="ghost" onClick={handleExport} disabled={!messages.length} aria-label="Export chat" className="h-7 w-7">
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleClear} disabled={!messages.length} aria-label="Clear chat" className="h-7 w-7">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {showWelcome && (
          <div className="text-center py-6 space-y-4">
            <div className="inline-flex p-3 rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Welcome to FitX AI Coach</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Ask about workouts, nutrition, form, recovery, or motivation. Responses stream in real time.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => sendMessage(qp.text)}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-border/30 bg-background/40 hover:bg-background/70 transition-colors text-left"
                >
                  <qp.icon className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-[11px] font-medium truncate">{qp.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 border ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground border-primary/40"
                  : "bg-background/60 border-border/30"
              }`}>
                <div className="flex items-center gap-1.5 mb-1 opacity-70">
                  {m.role === "user" ? <UserIcon className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                  <span className="text-[10px] font-medium">
                    {m.role === "user" ? "You" : "FitX AI"}
                  </span>
                  <span className="text-[9px]">{new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                {m.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-headings:mt-2 prose-headings:mb-1 text-[13px] leading-relaxed">
                    {m.content ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    ) : (
                      <div className="flex gap-1 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:120ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:240ms]" />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
                )}
                {m.role === "assistant" && m.content && (
                  <button
                    onClick={() => handleCopy(m.id, m.content)}
                    className="mt-1.5 inline-flex items-center gap-1 text-[10px] opacity-60 hover:opacity-100"
                  >
                    {copiedId === m.id ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/20 bg-background/40">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about fitness, nutrition, recovery…"
            className="min-h-[44px] max-h-[120px] resize-none text-sm rounded-xl bg-background/60"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            disabled={isStreaming}
          />
          <div className="flex flex-col gap-1.5">
            <Button
              size="icon"
              variant="outline"
              onClick={handleVoice}
              className={`h-9 w-9 rounded-xl ${isRecording ? "bg-red-500/10 border-red-500/40" : ""}`}
              aria-label="Voice input"
              disabled={isStreaming}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            {isStreaming ? (
              <Button size="icon" variant="destructive" onClick={handleStop} className="h-9 w-9 rounded-xl" aria-label="Stop">
                <StopCircle className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="h-9 w-9 rounded-xl"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <Badge variant="outline" className="text-[9px]">
            <Shield className="h-2.5 w-2.5 mr-1" /> JWT secured
          </Badge>
          <span className="text-[9px] text-muted-foreground">{messages.length} messages</span>
        </div>
      </div>
    </div>
  );
}

export default AIEnhancedChat;
