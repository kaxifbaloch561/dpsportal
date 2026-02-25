import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { messages, subject, className } = await req.json();

    // Get the latest user message
    const userQuestion = messages[messages.length - 1]?.content?.trim();
    if (!userQuestion) {
      return new Response(JSON.stringify({ answer: "Please type a question." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract class number from className (e.g., "Class 10" -> 10)
    const classMatch = className?.match(/\d+/);
    const classId = classMatch ? parseInt(classMatch[0]) : null;

    // Extract subject_id from subject name
    const subjectId = subject?.toLowerCase().replace(/\s+/g, "-") || "";

    // Search using full-text search with keyword matching
    const searchTerms = userQuestion
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w: string) => w.length > 2)
      .join(" & ");

    let results: any[] = [];

    if (searchTerms && classId) {
      // Try full-text search first
      const { data: ftsResults } = await supabase
        .from("chapter_qa")
        .select("question, answer")
        .eq("class_id", classId)
        .eq("subject_id", subjectId)
        .textSearch("search_vector", searchTerms, { type: "plain" })
        .limit(3);

      results = ftsResults || [];

      // Fallback: ILIKE search if no FTS results
      if (results.length === 0) {
        const keywords = userQuestion
          .toLowerCase()
          .replace(/[^\w\s]/g, "")
          .split(/\s+/)
          .filter((w: string) => w.length > 2);

        for (const keyword of keywords) {
          const { data: ilikeResults } = await supabase
            .from("chapter_qa")
            .select("question, answer")
            .eq("class_id", classId)
            .eq("subject_id", subjectId)
            .ilike("question", `%${keyword}%`)
            .limit(3);

          if (ilikeResults && ilikeResults.length > 0) {
            results = ilikeResults;
            break;
          }
        }
      }
    }

    if (results.length > 0) {
      // Return the best matching answer(s) exactly as stored
      const answer = results.map((r: any) => r.answer).join("\n\n---\n\n");
      return new Response(JSON.stringify({ answer }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ answer: "Sorry, this question is not available in our database yet. Please try a different question from your syllabus." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Chatbot error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
