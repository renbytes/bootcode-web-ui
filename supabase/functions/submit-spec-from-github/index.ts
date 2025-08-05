// supabase/functions/submit-spec-from-github/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Regular expression to parse GitHub URLs
const GITHUB_URL_REGEX = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)/;

// Function to parse TOML content
function parseToml(tomlContent: string): any {
  // A simple, dependency-free TOML parser.
  const data: any = { project: {}, datasets: [], metrics: [], outputDatasets: [] };
  let currentSection: any[] | null = null;
  let currentSectionName: string | null = null;

  tomlContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('[[') && trimmed.endsWith(']]')) {
      const sectionName = trimmed.slice(2, -2);
      currentSectionName = sectionName;
      if (!data[sectionName]) {
        data[sectionName] = [];
      }
      currentSection = data[sectionName];
      currentSection.push({});
    } else if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        const sectionName = trimmed.slice(1, -1);
        currentSectionName = sectionName;
        data[sectionName] = {};
        currentSection = null; // Reset section context
    } else if (trimmed.includes('=')) {
      const [key, value] = trimmed.split('=').map(s => s.trim());
      const parsedValue = value.replace(/"/g, '');
      
      if (currentSection) {
        currentSection[currentSection.length - 1][key] = parsedValue;
      } else if (currentSectionName) {
        data[currentSectionName][key] = parsedValue;
      } else {
        data[key] = parsedValue;
      }
    }
  });
  return data;
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
    // Updated to look for spec.toml specifically
    const specUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/spec.toml`;

    // Fetch the spec.toml file from the repository
    const specResponse = await fetch(specUrl);
    if (!specResponse.ok) {
      throw new Error(`Could not fetch spec.toml from ${githubUrl}. Make sure it exists in the main branch.`);
    }
    const tomlContent = await specResponse.text();
    const specData = parseToml(tomlContent);

    // Create a Supabase client with the service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Get the authenticated user's ID from the request's Authorization header
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

    // **FIX: Ensure a profile exists for the user before proceeding.**
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile) {
        // Profile doesn't exist, so create it.
        const { error: insertProfileError } = await supabaseAdmin.from('profiles').insert({
            id: user.id,
            username: user.user_metadata.user_name,
            avatar_url: user.user_metadata.avatar_url,
        });
        if (insertProfileError) {
            console.error('Error creating profile:', insertProfileError);
            throw new Error(`Failed to create user profile: ${insertProfileError.message}`);
        }
    }

    // Insert the parsed data into the 'specs' table
    const { data, error } = await supabaseAdmin.from('specs').insert({
      user_id: user.id,
      name: specData.project.name,
      description: specData.description,
      language: specData.language,
      project_type: specData.project_type,
      version: specData.project.version,
      github_url: githubUrl,
      toml_content: tomlContent,
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
