// supabase/functions/get-plugin-info/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

/**
 * A robust function to find a compatible release asset.
 * It understands common aliases for OS (darwin, apple-darwin) and
 * architectures (amd64, x86_64) to handle inconsistencies
 * between different build scripts.
 *
 * @param assets - The list of assets from a GitHub release.
 * @param targetOS - The OS the client is requesting (e.g., 'apple-darwin').
 * @param targetArch - The architecture the client is requesting (e.g., 'arm64').
 * @returns A matching asset object or null.
 */
function findMatchingAsset(assets: any[], targetOS: string, targetArch: string): any | null {
  // Define aliases for platform names.
  const osAliases: { [key: string]: string[] } = {
    'apple-darwin': ['darwin', 'apple-darwin', 'macos'],
    'linux': ['linux'],
    'windows': ['windows'],
  };
  const archAliases: { [key: string]: string[] } = {
    'arm64': ['arm64', 'aarch64'],
    'amd64': ['amd64', 'x86_64', 'x64'],
  };

  const relevantOSAliases = osAliases[targetOS] || [targetOS];
  const relevantArchAliases = archAliases[targetArch] || [targetArch];

  for (const asset of assets) {
    const assetName = asset.name.toLowerCase();

    // Check if the asset name contains one of the OS and Arch aliases.
    const osMatch = relevantOSAliases.some(alias => assetName.includes(alias));
    const archMatch = relevantArchAliases.some(alias => assetName.includes(alias));

    if (osMatch && archMatch) {
      return asset; // Found a compatible asset!
    }
  }

  return null; // No compatible asset found.
}

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
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: plugin, error: dbError } = await supabaseAdmin
      .from('plugins')
      .select('github_url, language, install_strategy')
      .eq('name', pluginName)
      .single();

    if (dbError) throw dbError;
    if (!plugin) throw new Error(`Plugin '${pluginName}' not found.`);

    let responsePayload;

    if (plugin.install_strategy === 'pipx') {
      responsePayload = {
        name: pluginName,
        language: plugin.language,
        github_url: plugin.github_url,
        install_strategy: 'pipx',
      };
    } else if (plugin.install_strategy === 'binary') {
      const match = plugin.github_url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) throw new Error('Invalid GitHub URL in database.');
      const [, owner, repo] = match;

      const releaseUrl = `https://api.github.com/repos/${owner}/${repo}/releases`;
      const ghResponse = await fetch(releaseUrl);
      if (!ghResponse.ok) {
        throw new Error(`Could not fetch releases from GitHub for ${owner}/${repo}.`);
      }

      const releases = await ghResponse.json();
      if (!releases || releases.length === 0) {
        throw new Error(`No releases found for ${owner}/${repo}.`);
      }
      const latestRelease = releases[0];

      // Use the new, more robust asset finding logic.
      const asset = findMatchingAsset(latestRelease.assets, userOS, userArch);

      if (!asset) {
        throw new Error(`No compatible release asset found for ${userOS}/${userArch} in release ${latestRelease.tag_name}.`);
      }

      responsePayload = {
        name: pluginName,
        language: plugin.language,
        version: latestRelease.tag_name,
        download_url: asset.browser_download_url,
        install_strategy: 'binary',
      };
    } else {
      throw new Error(`Unsupported install_strategy: '${plugin.install_strategy}'`);
    }

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