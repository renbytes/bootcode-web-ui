// supabase/functions/submit-plugin-from-github/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { parse } from 'https://deno.land/std@0.208.0/toml/mod.ts';

const GITHUB_URL_REGEX = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)/;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { githubUrl } = await req.json();
    const match = githubUrl.match(GITHUB_URL_REGEX);
    if (!match) throw new Error('Invalid GitHub URL format.');

    const [, owner, repo] = match;
    const manifestUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/plugin.toml`;

    // 1. Fetch and parse the manifest.
    const manifestResponse = await fetch(manifestUrl);
    if (!manifestResponse.ok) throw new Error(`Could not find 'plugin.toml' in ${githubUrl}.`);
    const manifestData = parse(await manifestResponse.text());
    const pluginMeta = manifestData.plugin;

    if (!pluginMeta || !pluginMeta.name || !pluginMeta.language || !pluginMeta.install_strategy) {
      throw new Error("'plugin.toml' is missing required fields: name, language, install_strategy.");
    }

    // 2. Dynamically determine the version.
    let version = 'latest'; // Default for non-binary or unreleased projects
    if (pluginMeta.install_strategy === 'binary') {
      const releaseUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
      const ghResponse = await fetch(releaseUrl);

      if (ghResponse.ok) {
        const release = await ghResponse.json();
        version = release.tag_name || 'latest'; // Use tag_name as the version
      } else {
        console.warn(`Could not fetch latest release for ${owner}/${repo}. Defaulting version to 'latest'.`);
      }
    }

    // 3. Get user and insert into the database.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Missing Authorization header.");
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("User not authenticated.");

    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data, error } = await supabaseAdmin.from('plugins').insert({
      user_id: user.id,
      name: pluginMeta.name,
      description: pluginMeta.description || 'No description provided.',
      language: pluginMeta.language,
      github_url: githubUrl,
      install_strategy: pluginMeta.install_strategy,
      version: version, // Store the dynamically fetched version
    }).select().single();

    if (error) throw error;

    return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});