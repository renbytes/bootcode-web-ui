// supabase/functions/submit-plugin-from-github/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Regular expression to parse GitHub URLs
const GITHUB_URL_REGEX = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)/;

// Simple TOML parser to find specific keys
function parseTomlValue(content: string, key: string): string | null {
  const match = content.match(new RegExp(`^\\s*${key}\\s*=\\s*"(.*?)"`, "m"));
  return match ? match[1] : null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { githubUrl } = await req.json();
    const match = githubUrl.match(GITHUB_URL_REGEX);

    if (!match) {
      throw new Error('Invalid GitHub URL format.');
    }

    const [, owner, repo] = match;
    let language = '';
    let manifestContent = '';
    let manifestUrl = '';

    // --- Intelligent Manifest Detection ---
    // 1. Try to fetch pyproject.toml for Python projects
    manifestUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/pyproject.toml`;
    let manifestResponse = await fetch(manifestUrl);

    if (manifestResponse.ok) {
        language = 'python';
        manifestContent = await manifestResponse.text();
    } else {
        // 2. If that fails, try Cargo.toml for Rust projects
        manifestUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/Cargo.toml`;
        manifestResponse = await fetch(manifestUrl);
        if (manifestResponse.ok) {
            language = 'rust';
            manifestContent = await manifestResponse.text();
        } else {
            // 3. If neither is found, throw an error
            throw new Error(`Could not find 'pyproject.toml' or 'Cargo.toml' in ${githubUrl}.`);
        }
    }

    // Parse the manifest file for plugin metadata
    const name = parseTomlValue(manifestContent, 'name');
    const version = parseTomlValue(manifestContent, 'version');
    const description = parseTomlValue(manifestContent, 'description');

    if (!name || !version) {
        throw new Error(`Could not parse 'name' and 'version' from the project's manifest file.`);
    }

    // Create a Supabase client with the service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Get the authenticated user's ID
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        throw new Error("Missing Authorization header.");
    }
    const { data: { user } } = await createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
    ).auth.getUser();

    if (!user) {
        throw new Error("User not authenticated.");
    }

    // Insert the parsed data into the 'plugins' table
    const { data, error } = await supabaseAdmin.from('plugins').insert({
      user_id: user.id,
      name: name,
      description: description || 'No description provided.',
      language: language,
      version: version,
      github_url: githubUrl,
    }).select().single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
