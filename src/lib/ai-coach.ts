import { supabase } from "@/integrations/supabase/client";

export type CoachMessage = { role: "system" | "user" | "assistant"; content: string };

const PRIMER =
  "You are FitxFusion's AI fitness coach. Answer the user's actual question accurately and concisely. Give safe, practical fitness and nutrition guidance.";

/** Sends messages to the real AI coach and returns the full reply. */
export async function askCoach(messages: CoachMessage[], onDelta?: (text: string) => void): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Please sign in to use the AI Coach.");
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fitfusion-chat`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "system", content: PRIMER }, ...messages.slice(-16)],
      language: navigator.language || "en",
    }),
  });
  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "The AI Coach is unavailable right now.");
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const d = t.slice(5).trim();
      if (!d || d === "[DONE]") continue;
      try {
        const delta = JSON.parse(d)?.choices?.[0]?.delta?.content;
        if (typeof delta === "string") {
          answer += delta;
          onDelta?.(answer);
        }
      } catch {
        /* partial chunk */
      }
    }
  }
  if (!answer) throw new Error("Empty response from the AI Coach.");
  return answer;
}
