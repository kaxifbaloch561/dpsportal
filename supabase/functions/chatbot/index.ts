import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LONGCAT_API_KEY = Deno.env.get("LONGCAT_API_KEY");
    if (!LONGCAT_API_KEY) {
      throw new Error("LONGCAT_API_KEY is not configured");
    }

    const { messages, subject, className } = await req.json();

    const systemPrompt = `You are DPS.AI, an intelligent academic assistant for ${className} - ${subject}. You answer ONLY from the official syllabus content for this subject. Your responses must be accurate, helpful, and educational. If a question is not part of the syllabus, respond with exactly: "This question is not part of your syllabus." Do not answer questions unrelated to the subject.`;

    const response = await fetch("https://api.longcat.chat/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LONGCAT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "LongCat-Flash-Chat",
        temperature: 0.2,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Longcat API error [${response.status}]: ${errorText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "Sorry, I could not generate a response.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Chatbot error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
