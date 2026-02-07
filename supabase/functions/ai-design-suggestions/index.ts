import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const RequestSchema = z.object({
  description: z.string().trim().min(1, "Description is required").max(5000, "Description too long"),
  stylePreference: z.string().trim().max(100, "Style preference too long").optional(),
  currentImages: z.array(z.string().url().max(2000)).max(10, "Too many images").optional(),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: authError } = await supabaseClient.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", claimsData.claims.sub);

    // Validate input
    const rawBody = await req.json();
    const validation = RequestSchema.safeParse(rawBody);
    if (!validation.success) {
      console.log("Validation failed:", validation.error.issues);
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { description, stylePreference, currentImages } = validation.data;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing AI design request:", { description: description.substring(0, 100), stylePreference });

    const systemPrompt = `You are an expert fashion designer and sustainable fashion consultant specializing in clothing redesign and upcycling. Your role is to provide creative, practical, and stylish suggestions for transforming existing garments into new, fashionable pieces.

When providing suggestions:
1. Consider the customer's style preference (${stylePreference || 'modern'})
2. Focus on sustainable practices - repurposing, minimal waste
3. Provide specific, actionable design ideas
4. Include color palette suggestions when relevant
5. Consider current fashion trends while respecting timeless elegance
6. Suggest multiple options ranging from subtle to dramatic transformations

Format your response with clear sections:
- **Design Concept**: A brief creative vision
- **Suggested Transformations**: 3-4 specific ideas
- **Color & Material Suggestions**: Complementary elements
- **Styling Tips**: How to wear the redesigned piece
- **Sustainability Note**: Environmental benefits of this redesign`;

    const userMessage = `A customer wants to redesign their clothing with the following details:

Description: ${description}
Style Preference: ${stylePreference || 'modern'}

Please provide creative design suggestions and recommendations for transforming this garment into something beautiful and sustainable.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content;

    console.log("AI suggestion generated successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        suggestion,
        model: "google/gemini-3-flash-preview"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in ai-design-suggestions:", error);
    return new Response(
      JSON.stringify({ success: false, error: "An error occurred processing your request" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});