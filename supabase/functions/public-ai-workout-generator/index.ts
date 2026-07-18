import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const goal = typeof body.goal === "string" ? body.goal.slice(0, 200) : "";
    const duration = Number.isFinite(body.duration) ? Math.min(120, Math.max(5, body.duration)) : 30;
    const equipment = typeof body.equipment === "string" ? body.equipment.slice(0, 200) : "none";
    const level = ["beginner", "intermediate", "advanced"].includes(body.level) ? body.level : "beginner";
    const focus = typeof body.focus === "string" ? body.focus.slice(0, 100) : "full body";

    if (!goal) {
      return new Response(JSON.stringify({ error: "Please describe your fitness goal." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are an expert AI fitness coach powering a free public workout generator. Produce a safe, high-quality workout in strict JSON with this schema:
{
  "name": string,
  "summary": string,
  "duration_minutes": number,
  "difficulty": "beginner" | "intermediate" | "advanced",
  "focus": string,
  "warmup": [{"name": string, "duration": string, "instructions": string}],
  "exercises": [{"name": string, "sets": number, "reps": string, "rest": string, "instructions": string, "muscle_groups": string[]}],
  "cooldown": [{"name": string, "duration": string, "instructions": string}],
  "tips": string[],
  "estimated_calories": number
}
Return ONLY valid JSON, no markdown.`;

    const userPrompt = `Generate a workout.
Goal: ${goal}
Focus area: ${focus}
Duration: ${duration} minutes
Available equipment: ${equipment}
Fitness level: ${level}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("AI gateway error", res.status, text);
      if (res.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (res.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Workout generation failed.", details: text }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const content: string = data.choices?.[0]?.message?.content ?? "";
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not parse workout JSON from AI response");
    const workout = JSON.parse(match[0]);

    return new Response(JSON.stringify({ workout }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("public-ai-workout-generator error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
