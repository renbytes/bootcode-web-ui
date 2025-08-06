// supabase/functions/get-plugin-info/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // This now creates a client with the user's authentication context
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const url = new URL(req.url);
    const pluginName = url.searchParams.get('name');
    if (!pluginName) throw new Error('Plugin name is required.');

    const { data, error } = await supabase
      .from('plugins')
      .select('name, github_url, version')
      .eq('name', pluginName)
      .single();

    if (error) throw error;
    if (!data) throw new Error(`Plugin '${pluginName}' not found.`);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});