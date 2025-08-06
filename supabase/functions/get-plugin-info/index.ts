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
    const userOS = url.searchParams.get('os');
    const userArch = url.searchParams.get('arch');

    if (!pluginName || !userOS || !userArch) {
      throw new Error('Plugin name, os, and arch are required query parameters.');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Get all necessary plugin data from our database in one call
    const { data: plugin, error: dbError } = await supabaseAdmin
      .from('plugins')
      .select('github_url, language')
      .eq('name', pluginName)
      .single();

    if (dbError) throw dbError;
    if (!plugin) throw new Error(`Plugin '${pluginName}' not found.`);

    // For Python plugins, the installation is direct from Git, so we don't need the GitHub API.
    if (plugin.language === 'python') {
        return new Response(JSON.stringify({
            name: pluginName,
            language: plugin.language,
            github_url: plugin.github_url,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // For binary plugins (like Rust), proceed to find the download URL.
    const match = plugin.github_url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) throw new Error('Invalid GitHub URL in database.');
    const [, owner, repo] = match;

    const githubUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
    const ghResponse = await fetch(githubUrl);
    if (!ghResponse.ok) {
      throw new Error(`Could not fetch latest release from GitHub for ${owner}/${repo}.`);
    }
    const release = await ghResponse.json();

    const asset = findMatchingAsset(release.assets, userOS, userArch);
    if (!asset) {
      throw new Error(`No compatible release asset found for ${userOS}/${userArch}.`);
    }

    const responsePayload = {
      name: pluginName,
      language: plugin.language,
      version: release.tag_name,
      download_url: asset.browser_download_url,
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
