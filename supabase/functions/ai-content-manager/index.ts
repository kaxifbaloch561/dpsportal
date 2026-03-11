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
    const { rawText, chapterNumber, chapterTitle, classId, subjectId } = await req.json();

    if (!rawText || !chapterNumber || !chapterTitle || !classId || !subjectId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a professional textbook content formatter for an educational portal. You will receive raw plain text that contains a full chapter with exercises. Your job is to:

1. FORMAT THE CHAPTER CONTENT as clean semantic HTML matching this exact style:
   - Use <h1 style="text-align:center;"> for the chapter title
   - Use <h2> for main section headings (numbered like "1. Section Name")
   - Use <h3> for sub-headings (lettered like "a. Sub Section" or Roman numerals)
   - Use <h4> for sub-sub-headings (roman lowercase like "i. Topic")
   - Use <p> for paragraphs with proper text flow
   - Use <ul><li> for bullet points (especially Learning Outcomes)
   - Use <strong> for bold key terms
   - Use <table><thead><tr><th>...</th></tr></thead><tbody><tr><td>...</td></tr></tbody></table> for tabular data
   - IMPORTANT: Group related sentences into proper paragraphs (3-5 sentences per paragraph)
   - Keep the content EXACTLY as provided - do NOT add, remove, or change any factual content
   - Ensure proper spacing and structure for a textbook reading experience

2. EXTRACT ALL EXERCISES from the text and categorize each question into one of these types:
   - "fill_in_the_blanks" - Questions with blanks (______) to fill
   - "choose_correct_answer" - Multiple choice questions (MCQs) with options
   - "true_false" - True/False statements
   - "long_question_answers" - Long answer questions (detailed answers, typically 100+ words)
   - "short_question_answers" - Short answer questions (brief answers, definitions, etc.)
   - "match_columns" - Match the following type questions

For each exercise, extract:
- question: The question text
- answer: The answer if provided (null if not)
- options: Array of option strings for MCQs (null for others)
- correct_option: The correct option letter/text for MCQs (null for others)
- exercise_type: One of the types above

CRITICAL RULES:
- The chapter content should NOT include the exercise section
- Separate chapter content from exercises clearly
- Keep all original text intact - do not paraphrase or modify content
- For MCQs, extract options as an array like ["option a text", "option b text", "option c text", "option d text"]
- For fill_in_the_blanks, if options are given in parentheses, extract them
- For true_false questions, answer should be "Tick" for true or "Cross" for false

Return ONLY valid JSON with this exact structure:
{
  "chapterContent": "<html string of formatted chapter>",
  "exercises": [
    {
      "question": "...",
      "answer": "...",
      "options": ["a", "b", "c", "d"] or null,
      "correct_option": "..." or null,
      "exercise_type": "..."
    }
  ]
}`;

    const userPrompt = `Here is the raw text for Chapter ${chapterNumber}: "${chapterTitle}" (Class ${classId}, Subject: ${subjectId}). Please format it professionally and extract all exercises.

RAW TEXT:
${rawText}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "AI processing failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    const rawContent = aiData.choices?.[0]?.message?.content;

    if (!rawContent) {
      return new Response(
        JSON.stringify({ error: "AI returned empty response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON from AI response (may be wrapped in ```json ... ```)
    let parsed;
    try {
      let jsonStr = rawContent.trim();
      // Remove markdown code fences if present
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      }
      parsed = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("Failed to parse AI response:", rawContent.substring(0, 500));
      return new Response(
        JSON.stringify({ error: "AI response format error. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!parsed.chapterContent || !Array.isArray(parsed.exercises)) {
      return new Response(
        JSON.stringify({ error: "AI response missing required fields." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI content manager error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
