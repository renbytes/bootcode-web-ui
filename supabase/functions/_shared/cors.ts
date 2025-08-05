// supabase/functions/_shared/cors.ts
// These are the standard CORS headers for Supabase Edge Functions.
// They allow requests from any origin and permit the necessary headers
// for the Supabase client library to work correctly.

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  