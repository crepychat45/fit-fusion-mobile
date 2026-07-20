import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import type { User } from "@supabase/supabase-js";

export type ChatThreadRow = Database["public"]["Tables"]["chat_threads"]["Row"];
export type ChatMessageRow = Database["public"]["Tables"]["chat_messages"]["Row"];
export type ChatDirectoryUser = Database["public"]["Tables"]["chat_user_directory"]["Row"];

export const FITBOT_ID = "fitbot";

const displayNameForUser = (user: User) => {
  const meta = user.user_metadata ?? {};
  return String(meta.name || meta.full_name || meta.username || user.email?.split("@")[0] || "FitFusion Member").slice(0, 80);
};

const avatarForUser = (user: User) => {
  const meta = user.user_metadata ?? {};
  return typeof meta.avatar_url === "string" ? meta.avatar_url : null;
};

export const userSnapshot = (user: User) => ({
  id: user.id,
  name: displayNameForUser(user),
  email: user.email ?? null,
  avatar: avatarForUser(user),
  role: "user",
});

export const fitbotSnapshot = {
  id: FITBOT_ID,
  name: "Fit Bot AI",
  avatar: null,
  role: "assistant",
  verified: true,
};

export async function ensureChatDirectoryProfile(user: User) {
  const payload = {
    user_id: user.id,
    display_name: displayNameForUser(user),
    username: user.email?.split("@")[0]?.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 40) || null,
    avatar_url: avatarForUser(user),
    status: "online",
    last_seen: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("chat_user_directory")
    .upsert(payload, { onConflict: "user_id" });

  if (error) throw error;
}

export async function markChatDirectoryOffline(userId: string) {
  await supabase
    .from("chat_user_directory")
    .update({ status: "offline", last_seen: new Date().toISOString() })
    .eq("user_id", userId);
}

export async function listChatThreads() {
  const { data, error } = await supabase
    .from("chat_threads")
    .select("*")
    .eq("is_archived", false)
    .order("is_pinned", { ascending: false })
    .order("last_message_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function ensureAiThread(user: User, title = "FitX AI Coach") {
  const { data: existing, error: existingError } = await supabase
    .from("chat_threads")
    .select("*")
    .eq("owner_id", user.id)
    .eq("thread_type", "ai")
    .eq("title", title)
    .order("last_message_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from("chat_threads")
    .insert({
      owner_id: user.id,
      title,
      thread_type: "ai",
      participant_ids: [user.id],
      participant_snapshot: [userSnapshot(user), fitbotSnapshot] as unknown as Json,
      encryption_enabled: true,
      last_message_preview: "Ask Fit Bot AI about workouts, nutrition, recovery, or motivation.",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function createDirectThread(currentUser: User, contact: ChatDirectoryUser) {
  const { data: existing, error: existingError } = await supabase
    .from("chat_threads")
    .select("*")
    .eq("thread_type", "direct")
    .contains("participant_ids", [currentUser.id, contact.user_id])
    .order("last_message_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from("chat_threads")
    .insert({
      owner_id: currentUser.id,
      title: contact.display_name,
      thread_type: "direct",
      participant_ids: [currentUser.id, contact.user_id],
      participant_snapshot: [
        userSnapshot(currentUser),
        {
          id: contact.user_id,
          name: contact.display_name,
          username: contact.username,
          avatar: contact.avatar_url,
          status: contact.status,
          role: "user",
        },
      ] as unknown as Json,
      encryption_enabled: true,
      last_message_preview: `Secure chat started with ${contact.display_name}`,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function createGroupThread(currentUser: User, title: string, contacts: ChatDirectoryUser[]) {
  const participantIds = Array.from(new Set([currentUser.id, ...contacts.map((contact) => contact.user_id)]));
  const { data, error } = await supabase
    .from("chat_threads")
    .insert({
      owner_id: currentUser.id,
      title: title.trim().slice(0, 80) || "Fitness Group",
      thread_type: "group",
      participant_ids: participantIds,
      participant_snapshot: [
        userSnapshot(currentUser),
        ...contacts.map((contact) => ({
          id: contact.user_id,
          name: contact.display_name,
          username: contact.username,
          avatar: contact.avatar_url,
          status: contact.status,
          role: "user",
        })),
      ] as unknown as Json,
      encryption_enabled: true,
      last_message_preview: "Encrypted group created",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function listChatMessages(threadId: string) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function addChatMessage(input: {
  threadId: string;
  content: string;
  senderRole: "user" | "assistant" | "system";
  senderId?: string | null;
  recipientId?: string | null;
  clientMessageId?: string;
  attachments?: Json;
  metadata?: Json;
}) {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      thread_id: input.threadId,
      content: input.content,
      sender_role: input.senderRole,
      sender_id: input.senderId ?? null,
      recipient_id: input.recipientId ?? null,
      client_message_id: input.clientMessageId,
      attachments: input.attachments ?? [],
      metadata: input.metadata ?? {},
      is_read: input.senderRole !== "user",
    })
    .select("*")
    .single();

  if (error) throw error;
  await touchChatThread(input.threadId, input.content);
  return data;
}

export async function touchChatThread(threadId: string, preview: string) {
  const { error } = await supabase
    .from("chat_threads")
    .update({
      last_message_preview: preview.slice(0, 180),
      last_message_at: new Date().toISOString(),
    })
    .eq("id", threadId);

  if (error) throw error;
}

export async function updateChatThread(threadId: string, updates: Partial<Pick<ChatThreadRow, "is_pinned" | "is_archived" | "is_muted" | "title">>) {
  const { error } = await supabase.from("chat_threads").update(updates).eq("id", threadId);
  if (error) throw error;
}

export async function deleteChatThread(threadId: string) {
  const { error } = await supabase.from("chat_threads").delete().eq("id", threadId);
  if (error) throw error;
}

export async function clearChatThreadMessages(threadId: string) {
  const { error } = await supabase.from("chat_messages").delete().eq("thread_id", threadId);
  if (error) throw error;
  await touchChatThread(threadId, "Chat cleared");
}

export async function searchChatContacts(query: string, currentUserId: string) {
  const sanitized = query.trim().replace(/[%_,]/g, "").slice(0, 60);
  let request = supabase
    .from("chat_user_directory")
    .select("*")
    .neq("user_id", currentUserId)
    .order("display_name", { ascending: true })
    .limit(20);

  if (sanitized) {
    request = request.or(`display_name.ilike.%${sanitized}%,username.ilike.%${sanitized}%`);
  }

  const { data, error } = await request;
  if (error) throw error;
  return data ?? [];
}