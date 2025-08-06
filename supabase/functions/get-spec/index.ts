// supabase/functions/get-spec/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const specId = url.searchParams.get('id');

    if (!specId) {
      throw new Error('Spec ID is required.');
    }

    // Use the public anon key for read-only operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data, error } = await supabase
      .from('specs')
      .select('toml_content')
      .eq('id', specId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Spec not found.');

    // Return the raw TOML content as plain text
    const headers = { ...corsHeaders, 'Content-Type': 'text/plain' };
    return new Response(data.toml_content, { headers });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});