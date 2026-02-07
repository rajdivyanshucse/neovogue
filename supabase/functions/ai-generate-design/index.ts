import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const GenerateSchema = z.object({
  prompt: z.string().trim().min(5, "Prompt too short").max(2000, "Prompt too long"),
  title: z.string().trim().max(200, "Title too long").optional(),
  description: z.string().trim().max(2000, "Description too long").optional(),
  stylePreference: z.string().trim().max(100, "Style preference too long").optional(),
  originalImageUrl: z.string().url("Invalid URL").max(2000, "URL too long").optional(),
  inspirationImageUrl: z.string().url("Invalid URL").max(2000, "URL too long").optional(),
});

serve(async (req) => {
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
    const validation = GenerateSchema.safeParse(rawBody);
    if (!validation.success) {
      console.log("Validation failed:", validation.error.issues);
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { prompt, title, description, stylePreference, originalImageUrl, inspirationImageUrl } = validation.data;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const hasOriginal = !!originalImageUrl;
    const hasInspiration = !!inspirationImageUrl;

    console.log("Generating AI design image:", { 
      prompt: prompt.substring(0, 100), 
      title: title?.substring(0, 50),
      stylePreference, 
      hasOriginal,
      hasInspiration 
    });

    // Build a rich, context-aware prompt
    let enhancedPrompt = `You are a professional fashion designer. Generate a realistic, high-quality fashion design image.\n\n`;
    
    if (title) {
      enhancedPrompt += `Project: ${title}\n`;
    }
    if (description) {
      enhancedPrompt += `Customer's vision: ${description}\n`;
    }
    enhancedPrompt += `Design request: ${prompt}\n`;
    enhancedPrompt += `Style: ${stylePreference || 'modern elegant'}\n\n`;

    if (hasOriginal && hasInspiration) {
      enhancedPrompt += `IMPORTANT: I am providing TWO reference images. The FIRST image is the ORIGINAL garment/cloth that needs to be redesigned. The SECOND image is the DESIRED DESIGN / INSPIRATION showing what the customer wants it to look like. Please generate a realistic redesigned garment that transforms the original cloth into a design inspired by the second reference image. Combine the fabric/material from the original with the silhouette, style, and design elements from the inspiration image.\n\n`;
    } else if (hasOriginal) {
      enhancedPrompt += `IMPORTANT: The provided image is the ORIGINAL garment/cloth. Please generate a realistic redesigned version of this garment based on the design request above.\n\n`;
    } else if (hasInspiration) {
      enhancedPrompt += `IMPORTANT: The provided image is a DESIGN INSPIRATION / REFERENCE. Please generate a new realistic garment design inspired by this reference image.\n\n`;
    }

    enhancedPrompt += `Requirements: Photorealistic fashion photography quality, professional studio lighting, detailed fabric textures, wearable garment design, sustainable fashion upcycling concept. Ultra high resolution.`;

    // Build message content with images
    const contentParts: any[] = [{ type: "text", text: enhancedPrompt }];
    
    if (originalImageUrl) {
      contentParts.push({ type: "image_url", image_url: { url: originalImageUrl } });
    }
    if (inspirationImageUrl) {
      contentParts.push({ type: "image_url", image_url: { url: inspirationImageUrl } });
    }

    const messages: any[] = [
      {
        role: "user",
        content: contentParts.length > 1 ? contentParts : enhancedPrompt
      }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages,
        modalities: ["image", "text"]
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
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textContent = data.choices?.[0]?.message?.content;

    console.log("AI design image generated successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl,
        description: textContent,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in ai-generate-design:", error);
    return new Response(
      JSON.stringify({ success: false, error: "An error occurred processing your request" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
