import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  addChatMessage,
  clearChatThreadMessages,
  createDirectThread,
  createGroupThread,
  deleteChatThread,
  ensureAiThread,
  ensureChatDirectoryProfile,
  FITBOT_ID,
  fitbotSnapshot,
  listChatMessages,
  listChatThreads,
  searchChatContacts,
  touchChatThread,
  updateChatThread,
  type ChatDirectoryUser,
  type ChatMessageRow,
  type ChatThreadRow,
} from "@/utils/chat-db";
import type { User } from "@supabase/supabase-js";
import {
  Archive,
  Bot,
  Download,
  FileText,
  Image as ImageIcon,
  Info,
  Loader2,
  Mail,
  MoreVertical,
  Paperclip,
  Phone,
  Pin,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  Video as VideoIcon,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import fitBotAvatar from "@/assets/fitbot-coach-avatar.png";

interface AdvancedChatInterfaceProps {
  user?: User | null;
  onLogout?: () => void;
  securityLevel?: string;
  notificationsEnabled?: boolean;
  defaultMode?: "all" | "ai" | "direct";
  compact?: boolean;
  className?: string;
}

type ContactPick = ChatDirectoryUser & { selected?: boolean };

const formatTime = (value?: string | null) => {
  if (!value) return "now";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const jsonArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const getThreadAvatar = (thread: ChatThreadRow, currentUserId?: string) => {
  const people = jsonArray<Record<string, unknown>>(thread.participant_snapshot);
  const other = people.find((person) => String(person.id) !== currentUserId) ?? people[0];
  return typeof other?.avatar === "string" ? other.avatar : null;
};

const getThreadInitial = (thread: ChatThreadRow) => {
  if (thread.thread_type === "ai") return "AI";
  if (thread.thread_type === "group") return "G";
  return (thread.title || "C").slice(0, 1).toUpperCase();
};

const messageRole = (message: ChatMessageRow, currentUserId?: string) => {
  if (message.sender_role === "assistant") return "assistant";
  if (message.sender_role === "system") return "system";
  return message.sender_id === currentUserId ? "own" : "other";
};

const quickPrompts = [
  "Create a 25-minute beginner workout for today",
  "What should I eat after strength training?",
  "Make a recovery plan for sore legs",
  "Build a weekly fat-loss routine",
];

const mergeMessage = (rows: ChatMessageRow[], row: ChatMessageRow) => {
  if (rows.some((message) => message.id === row.id)) {
    return rows.map((message) => (message.id === row.id ? row : message));
  }
  return [...rows, row];
};

export function AdvancedChatInterface({
  user: providedUser,
  securityLevel = "high",
  defaultMode = "all",
  compact = false,
  className,
}: AdvancedChatInterfaceProps) {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(providedUser ?? null);
  const [threads, setThreads] = useState<ChatThreadRow[]>([]);
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [threadSearch, setThreadSearch] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [contacts, setContacts] = useState<ContactPick[]>([]);
  const [contactQuery, setContactQuery] = useState("");
  const [showContacts, setShowContacts] = useState(false);
  const [showGroup, setShowGroup] = useState(false);
  const [groupName, setGroupName] = useState("Fitness Squad");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [aiStreaming, setAiStreaming] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notifiedIdsRef = useRef<Set<string>>(new Set());

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? null,
    [threads, activeThreadId],
  );

  const filteredThreads = useMemo(() => {
    const q = threadSearch.trim().toLowerCase();
    const base = defaultMode === "ai" ? threads.filter((thread) => thread.thread_type === "ai") : threads;
    if (!q) return base;
    return base.filter((thread) =>
      [thread.title, thread.last_message_preview, thread.thread_type]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [defaultMode, threadSearch, threads]);

  const filteredMessages = useMemo(() => {
    const q = messageSearch.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((message) => message.content.toLowerCase().includes(q));
  }, [messageSearch, messages]);

  const loadThreads = useCallback(async (preferredThreadId?: string) => {
    const rows = await listChatThreads();
    setThreads(rows);

    const preferred = preferredThreadId && rows.some((thread) => thread.id === preferredThreadId) ? preferredThreadId : null;
    const firstByMode = defaultMode === "ai" ? rows.find((thread) => thread.thread_type === "ai") : rows[0];
    setActiveThreadId((current) => preferred ?? (current && rows.some((thread) => thread.id === current) ? current : firstByMode?.id ?? null));
    return rows;
  }, [defaultMode]);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    try {
      const authUser = providedUser ?? (await supabase.auth.getUser()).data.user;
      setCurrentUser(authUser ?? null);
      if (!authUser) {
        setThreads([]);
        setMessages([]);
        setActiveThreadId(null);
        return;
      }

      await ensureChatDirectoryProfile(authUser);
      const aiThread = await ensureAiThread(authUser);
      const rows = await loadThreads(defaultMode === "ai" ? aiThread.id : undefined);
      if (!rows.length) setActiveThreadId(aiThread.id);
    } catch (error) {
      console.error("Chat bootstrap failed", error);
      toast({ title: "Chat loading failed", description: "Please refresh or reconnect.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [defaultMode, loadThreads, providedUser, toast]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (!activeThreadId) {
      setMessages([]);
      return;
    }

    let mounted = true;
    listChatMessages(activeThreadId)
      .then((rows) => mounted && setMessages(rows))
      .catch((error) => {
        console.error("Message load failed", error);
        toast({ title: "Messages failed to load", variant: "destructive" });
      });

    return () => {
      mounted = false;
    };
  }, [activeThreadId, toast]);

  useEffect(() => {
    if (!currentUser) return undefined;

    const threadChannel = supabase
      .channel(`chat-threads-${currentUser.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_threads" }, () => loadThreads(activeThreadId ?? undefined))
      .subscribe();

    const messageChannel = supabase
      .channel(`chat-messages-${currentUser.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const row = payload.new as ChatMessageRow;
        if (!row) return;
        // Append instantly if it belongs to the open thread
        if (row.thread_id === activeThreadId) {
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
        }
        // Fire browser notification for incoming (not from me, not streamed placeholder)
        const fromOther = row.sender_id && row.sender_id !== currentUser.id;
        const isAssistant = row.sender_role === "assistant";
        if ((fromOther || (isAssistant && row.thread_id !== activeThreadId)) && !notifiedIdsRef.current.has(row.id)) {
          notifiedIdsRef.current.add(row.id);
          const shouldNotify = document.hidden || row.thread_id !== activeThreadId;
          if (shouldNotify && typeof Notification !== "undefined" && Notification.permission === "granted") {
            try {
              const senderName = isAssistant ? "FitX AI Coach" : "New message";
              new Notification(senderName, {
                body: (row.content || "New chat activity").slice(0, 140),
                icon: "/manifest-icon-192.png",
                tag: `chat-${row.thread_id}`,
              });
            } catch {
              /* ignore */
            }
          }
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_messages" }, (payload) => {
        const row = payload.new as ChatMessageRow;
        if (!row || row.thread_id !== activeThreadId) return;
        setMessages((prev) => prev.map((m) => (m.id === row.id ? row : m)));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "chat_messages" }, (payload) => {
        const row = payload.old as ChatMessageRow;
        if (!row || row.thread_id !== activeThreadId) return;
        setMessages((prev) => prev.filter((m) => m.id !== row.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(threadChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [activeThreadId, currentUser, loadThreads]);

  // Request notification permission once
  useEffect(() => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, aiStreaming]);

  const loadContacts = useCallback(async (query = contactQuery) => {
    if (!currentUser) return;
    try {
      const rows = await searchChatContacts(query, currentUser.id);
      setContacts(rows);
    } catch (error) {
      console.error("Contact search failed", error);
      toast({ title: "Could not search users", variant: "destructive" });
    }
  }, [contactQuery, currentUser, toast]);

  useEffect(() => {
    if (!showContacts && !showGroup) return;
    const id = window.setTimeout(() => loadContacts(), 250);
    return () => window.clearTimeout(id);
  }, [contactQuery, loadContacts, showContacts, showGroup]);

  const callAi = async (threadId: string, prompt: string) => {
    if (!currentUser) return;
    setAiStreaming(true);
    try {
      const history = [...messages, { sender_role: "user", content: prompt }]
        .slice(-20)
        .map((message) => ({
          role: message.sender_role === "assistant" ? "assistant" : "user",
          content: message.content,
        }));

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Missing session");

      const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fitfusion-chat`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: history, language: (typeof navigator !== "undefined" ? navigator.language : "") || "en" }),
      });

      if (!response.ok || !response.body) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "AI response failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      const tempId = `stream-${Date.now()}`;
      const now = new Date().toISOString();

      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          thread_id: threadId,
          content: "",
          sender_role: "assistant",
          sender_id: null,
          recipient_id: currentUser.id,
          client_message_id: tempId,
          attachments: [],
          reactions: [],
          metadata: {},
          encrypted_payload: null,
          is_read: true,
          created_at: now,
          updated_at: now,
        },
      ]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed?.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              assistantText += delta;
              setMessages((prev) => prev.map((message) => (message.id === tempId ? { ...message, content: assistantText } : message)));
            }
          } catch {
            // Ignore heartbeat / provider metadata chunks.
          }
        }
      }

      const finalText = assistantText.trim() || "I’m ready — ask me about your next workout, recovery, or nutrition plan.";
      const savedAssistant = await addChatMessage({
        threadId,
        content: finalText,
        senderRole: "assistant",
        senderId: null,
        recipientId: currentUser.id,
        metadata: { source: "lovable_ai" },
      });
      setMessages((prev) => prev.map((message) => (message.id === tempId ? savedAssistant : message)));
    } catch (error) {
      console.error("AI chat failed", error);
      toast({ title: "Fit Bot AI failed", description: error instanceof Error ? error.message : "Try again.", variant: "destructive" });
      const fallback = await addChatMessage({
        threadId,
        content: "I could not connect to Fit Bot AI right now. Please try again in a moment.",
        senderRole: "assistant",
        senderId: null,
        recipientId: currentUser.id,
      }).catch(console.error);
      if (fallback) setMessages((prev) => mergeMessage(prev.filter((message) => !message.id.startsWith("stream-")), fallback));
    } finally {
      setAiStreaming(false);
      loadThreads(threadId).catch(console.error);
      listChatMessages(threadId).then(setMessages).catch(console.error);
    }
  };

  const handleSend = async (directContent?: string) => {
    const content = (directContent ?? input).trim();
    if (!content || !currentUser || !activeThread || sending) return;
    setInput("");
    setSending(true);

    try {
      const recipientId = activeThread.participant_ids.find((id) => id !== currentUser.id) ?? null;
      const savedUserMessage = await addChatMessage({
        threadId: activeThread.id,
        content,
        senderRole: "user",
        senderId: currentUser.id,
        recipientId: activeThread.thread_type === "direct" ? recipientId : null,
        metadata: { encrypted: true, securityLevel },
      });
      setMessages((prev) => mergeMessage(prev, savedUserMessage));
      await loadThreads(activeThread.id);
      if (activeThread.thread_type === "ai") await callAi(activeThread.id, content);
    } catch (error) {
      console.error("Send failed", error);
      toast({ title: "Message not sent", description: "Your message was not saved. Try again.", variant: "destructive" });
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const sendPromptNow = async (prompt: string) => {
    if (!currentUser || !activeThread || sending || aiStreaming) return;
    await handleSend(prompt);
  };

  const startDirectChat = async (contact: ChatDirectoryUser) => {
    if (!currentUser) return;
    try {
      const thread = await createDirectThread(currentUser, contact);
      await loadThreads(thread.id);
      setShowContacts(false);
      toast({ title: "Chat ready", description: `Secure chat opened with ${contact.display_name}.` });
    } catch (error) {
      console.error("Direct chat failed", error);
      toast({ title: "Could not start chat", variant: "destructive" });
    }
  };

  const createSelectedGroup = async () => {
    if (!currentUser) return;
    const selected = contacts.filter((contact) => contact.selected);
    if (!selected.length) {
      toast({ title: "Select at least one member", variant: "destructive" });
      return;
    }
    try {
      const thread = await createGroupThread(currentUser, groupName, selected);
      await addChatMessage({ threadId: thread.id, content: `Group “${thread.title}” created.`, senderRole: "system" });
      await loadThreads(thread.id);
      setShowGroup(false);
      setContacts((prev) => prev.map((contact) => ({ ...contact, selected: false })));
    } catch (error) {
      console.error("Group create failed", error);
      toast({ title: "Could not create group", variant: "destructive" });
    }
  };

  const exportThread = () => {
    if (!activeThread) return;
    const blob = new Blob([JSON.stringify({ thread: activeThread, messages }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${activeThread.title.replace(/\W+/g, "-").toLowerCase()}-chat.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const togglePin = async () => {
    if (!activeThread) return;
    await updateChatThread(activeThread.id, { is_pinned: !activeThread.is_pinned });
    await loadThreads(activeThread.id);
  };

  const archiveThread = async () => {
    if (!activeThread) return;
    await updateChatThread(activeThread.id, { is_archived: true });
    await loadThreads();
  };

  const clearThread = async () => {
    if (!activeThread) return;
    await clearChatThreadMessages(activeThread.id);
    setMessages([]);
  };

  const deleteThread = async () => {
    if (!activeThread || activeThread.thread_type === "ai") return;
    await deleteChatThread(activeThread.id);
    await loadThreads();
  };

  const threadIcon = (thread: ChatThreadRow) => {
    if (thread.thread_type === "ai") return <Bot className="h-4 w-4" />;
    if (thread.thread_type === "group") return <Users className="h-4 w-4" />;
    return null;
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files?.length || !currentUser || !activeThread) return;
    setUploading(true);
    try {
      const attachments: Array<{ url: string; name: string; type: string; size: number; kind: "image" | "video" | "file" }> = [];
      for (const file of Array.from(files).slice(0, 6)) {
        if (file.size > 25 * 1024 * 1024) {
          toast({ title: "File too large", description: `${file.name} exceeds 25MB`, variant: "destructive" });
          continue;
        }
        const ext = file.name.split(".").pop() || "bin";
        const path = `chat/${currentUser.id}/${activeThread.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("fitusion.data").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("fitusion.data").getPublicUrl(path);
        const kind: "image" | "video" | "file" = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file";
        attachments.push({ url: pub.publicUrl, name: file.name, type: file.type, size: file.size, kind });
      }
      if (!attachments.length) return;
      const recipientId = activeThread.participant_ids.find((id) => id !== currentUser.id) ?? null;
      const saved = await addChatMessage({
        threadId: activeThread.id,
        content: attachments.map((a) => `📎 ${a.name}`).join("\n"),
        senderRole: "user",
        senderId: currentUser.id,
        recipientId: activeThread.thread_type === "direct" ? recipientId : null,
        attachments: attachments as any,
        metadata: { hasAttachments: true, securityLevel },
      });
      setMessages((prev) => mergeMessage(prev, saved));
      await loadThreads(activeThread.id);
      toast({ title: "Uploaded", description: `${attachments.length} file(s) attached.` });
    } catch (error) {
      console.error("Upload failed", error);
      toast({ title: "Upload failed", description: error instanceof Error ? error.message : "Try a smaller file.", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openUserDetails = async () => {
    if (!activeThread || activeThread.thread_type === "ai") {
      setUserDetails({ ai: true });
      setShowUserDetails(true);
      return;
    }
    const people = jsonArray<Record<string, any>>(activeThread.participant_snapshot);
    const other = people.find((p) => String(p.id) !== currentUser?.id);
    setUserDetails(other ?? null);
    setShowUserDetails(true);
    // Enrich with profile/directory info
    if (other?.id) {
      try {
        const [{ data: directory }, { data: profile }] = await Promise.all([
          supabase.from("chat_user_directory").select("*").eq("user_id", other.id).maybeSingle(),
          supabase.from("profiles").select("*").eq("user_id", other.id).maybeSingle(),
        ]);
        setUserDetails((prev: any) => ({ ...(prev ?? {}), ...directory, ...profile, id: other.id, name: other.name }));
      } catch (error) {
        console.error("User details fetch failed", error);
      }
    }
  };

  if (loading) {
    return (
      <div className={cn("flex h-full min-h-[520px] items-center justify-center rounded-lg border bg-card/70", className)}>
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Loading secure chat…</span>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className={cn("flex h-full min-h-[420px] items-center justify-center rounded-lg border bg-card/70 p-6 text-center", className)}>
        <div>
          <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-primary" />
          <h3 className="font-semibold">Sign in required</h3>
          <p className="mt-1 text-sm text-muted-foreground">Open your account to use FitX Fusion Chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full min-h-[560px] w-full overflow-hidden rounded-lg border bg-background/95", compact ? "min-h-[calc(100dvh-12rem)]" : "", className)}>
      <aside className={cn("flex w-80 min-w-72 flex-col border-r bg-card/80 backdrop-blur-xl", compact && activeThread ? "hidden sm:flex" : "flex")}> 
        <div className="border-b p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold">FitX Fusion Chat</h2>
              <p className="text-xs text-muted-foreground">Database synced • encrypted metadata</p>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setShowContacts(true); loadContacts(""); }} title="Add chat">
                <UserPlus className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setShowGroup(true); loadContacts(""); }} title="Create group">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={threadSearch} onChange={(event) => setThreadSearch(event.target.value)} placeholder="Search chats…" className="pl-9" />
          </div>
        </div>

        <ScrollArea className="flex-1 custom-scrollbar">
          <div className="space-y-1 p-2">
            {filteredThreads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => setActiveThreadId(thread.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg p-3 text-left transition hover:bg-muted/70",
                  activeThreadId === thread.id && "bg-primary/10 ring-1 ring-primary/30",
                )}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={getThreadAvatar(thread, currentUser.id) ?? undefined} />
                  <AvatarFallback>{getThreadInitial(thread)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    {threadIcon(thread)}
                    <p className="truncate text-sm font-medium">{thread.title}</p>
                    {thread.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{thread.last_message_preview || "No messages yet"}</p>
                </div>
                <span className="text-[11px] text-muted-foreground">{formatTime(thread.last_message_at)}</span>
              </button>
            ))}
            {!filteredThreads.length && (
              <div className="p-6 text-center text-sm text-muted-foreground">No chats found.</div>
            )}
          </div>
        </ScrollArea>
      </aside>

      <main className={cn("flex min-w-0 flex-1 flex-col", compact && !activeThread ? "hidden sm:flex" : "flex")}> 
        {activeThread ? (
          <>
            <header className="flex items-center justify-between gap-3 border-b bg-card/70 p-3 backdrop-blur-xl">
              <div className="flex min-w-0 items-center gap-3">
                {compact && (
                  <Button size="icon" variant="ghost" className="h-8 w-8 sm:hidden" onClick={() => setActiveThreadId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <button
                  type="button"
                  onClick={openUserDetails}
                  className="flex min-w-0 items-center gap-3 rounded-lg px-1 py-0.5 text-left transition hover:bg-muted/60"
                  title={activeThread.thread_type === "ai" ? "About FitX AI Coach" : "View user details"}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activeThread.thread_type === "ai" ? fitBotAvatar : (getThreadAvatar(activeThread, currentUser.id) ?? undefined)} />
                    <AvatarFallback className={activeThread.thread_type === "ai" ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white" : ""}>
                      {activeThread.thread_type === "ai" ? "AI" : getThreadInitial(activeThread)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold flex items-center gap-1">
                      {activeThread.thread_type === "ai" ? "FitX AI Coach" : activeThread.title}
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{activeThread.thread_type === "ai" ? "Fast multilingual AI coach" : `${activeThread.participant_ids.length} participant${activeThread.participant_ids.length === 1 ? "" : "s"}`}</span>
                      <Badge variant="outline" className="h-5 px-1.5 text-[10px]"><ShieldCheck className="mr-1 h-3 w-3" />{securityLevel}</Badge>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setMessageSearch((value) => (value ? "" : " "))} title="Search messages">
                  <Search className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8" title="Chat actions"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={togglePin}><Pin className="mr-2 h-4 w-4" />{activeThread.is_pinned ? "Unpin" : "Pin"}</DropdownMenuItem>
                    <DropdownMenuItem onClick={exportThread}><Download className="mr-2 h-4 w-4" />Export chat</DropdownMenuItem>
                    <DropdownMenuItem onClick={archiveThread}><Archive className="mr-2 h-4 w-4" />Archive</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={clearThread}><Trash2 className="mr-2 h-4 w-4" />Clear messages</DropdownMenuItem>
                    {activeThread.thread_type !== "ai" && <DropdownMenuItem onClick={deleteThread} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete chat</DropdownMenuItem>}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            {messageSearch !== "" && (
              <div className="flex items-center gap-2 border-b bg-muted/30 p-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input autoFocus value={messageSearch.trimStart()} onChange={(event) => setMessageSearch(event.target.value)} placeholder="Search inside this chat…" className="h-9" />
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setMessageSearch("")}><X className="h-4 w-4" /></Button>
              </div>
            )}

            <ScrollArea className="flex-1 custom-scrollbar bg-muted/10 p-4">
              <div className="mx-auto flex max-w-3xl flex-col gap-3">
                {!filteredMessages.length && activeThread.thread_type === "ai" && (
                  <div className="mx-auto my-8 max-w-xl rounded-2xl border bg-card/80 p-5 text-center shadow-sm backdrop-blur-xl">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bot className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">Fit Bot AI is ready</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ask for workouts, diet guidance, recovery plans, motivation, or progress help. Replies stream live and save to your backend history.
                    </p>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {quickPrompts.map((prompt) => (
                        <Button
                          key={prompt}
                          type="button"
                          variant="outline"
                          className="h-auto justify-start whitespace-normal text-left text-xs"
                          onClick={() => sendPromptNow(prompt)}
                        >
                          <Sparkles className="mr-2 h-3.5 w-3.5 shrink-0" />
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                {!filteredMessages.length && activeThread.thread_type !== "ai" && (
                  <div className="mx-auto my-8 max-w-md rounded-2xl border bg-card/80 p-5 text-center shadow-sm">
                    <Users className="mx-auto mb-3 h-8 w-8 text-primary" />
                    <h3 className="font-semibold">Secure chat started</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Send the first message. It will sync to the backend for every participant.</p>
                  </div>
                )}
                {filteredMessages.map((message) => {
                  const role = messageRole(message, currentUser.id);
                  const attachments = jsonArray<any>(message.attachments as any);
                  return (
                    <div key={message.id} className={cn("flex gap-2", role === "own" ? "justify-end" : "justify-start")}> 
                      {role !== "own" && (
                        <Avatar className="mt-1 h-7 w-7">
                          {role === "assistant" ? <AvatarImage src={fitBotAvatar} /> : null}
                          <AvatarFallback className={role === "assistant" ? "bg-gradient-to-br from-blue-500 to-purple-600 text-[10px] text-white" : ""}>
                            {role === "assistant" ? "AI" : "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn("max-w-[82%] rounded-2xl px-3 py-2 text-sm shadow-sm", role === "own" ? "bg-primary text-primary-foreground" : role === "system" ? "border bg-muted text-muted-foreground" : "border bg-card")}> 
                        {attachments.length > 0 && (
                          <div className="mb-2 grid gap-2">
                            {attachments.map((att: any, idx: number) => (
                              <div key={idx}>
                                {att.kind === "image" ? (
                                  <a href={att.url} target="_blank" rel="noreferrer">
                                    <img src={att.url} alt={att.name} loading="lazy" className="max-h-64 rounded-lg object-cover" />
                                  </a>
                                ) : att.kind === "video" ? (
                                  <video src={att.url} controls className="max-h-64 rounded-lg" />
                                ) : (
                                  <a href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border bg-background/60 px-2 py-1 text-xs hover:bg-background">
                                    <FileText className="h-4 w-4" />
                                    <span className="truncate">{att.name}</span>
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {role === "assistant" ? (
                          <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content || "Thinking…"}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        )}
                        <p className={cn("mt-1 text-[10px]", role === "own" ? "text-primary-foreground/70" : "text-muted-foreground")}>{formatTime(message.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
                {aiStreaming && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> FitX AI Coach is answering…
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <footer className="border-t bg-card/80 p-3 backdrop-blur-xl">
              <div className="mx-auto flex max-w-3xl items-end gap-2">
                <Textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={activeThread.thread_type === "ai" ? "Ask Fit Bot AI for a workout, meal, recovery, or motivation plan…" : "Type a secure message…"}
                  className="min-h-[44px] resize-none"
                  rows={1}
                />
                <Button onClick={() => handleSend()} disabled={!input.trim() || sending || aiStreaming} className="h-11 px-4">
                  {sending || aiStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6 text-center">
            <div>
              <Sparkles className="mx-auto mb-3 h-9 w-9 text-primary" />
              <h3 className="font-semibold">Choose or create a chat</h3>
              <p className="mt-1 text-sm text-muted-foreground">Your AI and user-to-user messages are saved to the backend.</p>
            </div>
          </div>
        )}
      </main>

      <Dialog open={showContacts} onOpenChange={setShowContacts}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Start user-to-user chat</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input value={contactQuery} onChange={(event) => setContactQuery(event.target.value)} placeholder="Search by name or username…" />
            <ScrollArea className="h-72 rounded-md border custom-scrollbar">
              <div className="space-y-1 p-2">
                {contacts.map((contact) => (
                  <button key={contact.user_id} type="button" onClick={() => startDirectChat(contact)} className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted">
                    <Avatar><AvatarImage src={contact.avatar_url ?? undefined} /><AvatarFallback>{contact.display_name.slice(0, 1)}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{contact.display_name}</p><p className="truncate text-xs text-muted-foreground">@{contact.username || "fitfusion"} • {contact.status}</p></div>
                  </button>
                ))}
                {!contacts.length && <p className="p-6 text-center text-sm text-muted-foreground">No users found.</p>}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showGroup} onOpenChange={setShowGroup}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create encrypted group</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="Group name" />
            <Input value={contactQuery} onChange={(event) => setContactQuery(event.target.value)} placeholder="Search members…" />
            <ScrollArea className="h-64 rounded-md border custom-scrollbar">
              <div className="space-y-1 p-2">
                {contacts.map((contact) => (
                  <button key={contact.user_id} type="button" onClick={() => setContacts((prev) => prev.map((item) => item.user_id === contact.user_id ? { ...item, selected: !item.selected } : item))} className={cn("flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted", contact.selected && "bg-primary/10")}> 
                    <Avatar><AvatarImage src={contact.avatar_url ?? undefined} /><AvatarFallback>{contact.display_name.slice(0, 1)}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{contact.display_name}</p><p className="truncate text-xs text-muted-foreground">@{contact.username || "fitfusion"}</p></div>
                    {contact.selected && <Badge>Added</Badge>}
                  </button>
                ))}
              </div>
            </ScrollArea>
            <Button onClick={createSelectedGroup} className="w-full"><Users className="mr-2 h-4 w-4" />Create group</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}