// supabase/functions/get-plugin-info/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Helper to find the correct asset from a GitHub release
const findMatchingAsset = (assets: any[], os: string, arch: string): any | null => {
  for (const asset of assets) {
    const name = asset.name.toLowerCase();
    if (name.includes(arch) && name.includes(os)) {
      return asset;
    }
  }
  // Fallback for Python source distributions (.tar.gz)
  return assets.find(asset => asset.name.endsWith('.tar.gz')) || null;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pluginName = url.searchParams.get('name');
    const userOS = url.searchParams.get('os'); // e.g., 'apple-darwin'
    const userArch = url.searchParams.get('arch'); // e.g., 'arm64'

    if (!pluginName || !userOS || !userArch) {
      throw new Error('Plugin name, os, and arch are required query parameters.');
    }

    // Create a Supabase client with the service role key to read plugin data
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Get the plugin's GitHub URL from our database
    const { data: plugin, error: dbError } = await supabaseAdmin
      .from('plugins')
      .select('github_url, language')
      .eq('name', pluginName)
      .single();

    if (dbError) throw dbError;
    if (!plugin) throw new Error(`Plugin '${pluginName}' not found.`);

    const match = plugin.github_url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) throw new Error('Invalid GitHub URL in database.');
    const [, owner, repo] = match;

    // 2. Use the GitHub API to get the latest release information
    const githubUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
    const ghResponse = await fetch(githubUrl);
    if (!ghResponse.ok) {
      throw new Error(`Could not fetch latest release from GitHub for ${owner}/${repo}.`);
    }
    const release = await ghResponse.json();

    // 3. Find the correct download asset for the user's platform
    const asset = findMatchingAsset(release.assets, userOS, userArch);
    if (!asset) {
      throw new Error(`No compatible release asset found for ${userOS}/${userArch}.`);
    }

    // 4. Return the direct download URL and other metadata
    const responsePayload = {
      name: pluginName,
      language: plugin.language,
      version: release.tag_name,
      download_url: asset.browser_download_url, // The direct URL to the asset
    };

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
