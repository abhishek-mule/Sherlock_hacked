import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data } = await req.json();
    const rows = data.map((row: any) => ({
      name: row.name,
      surname: row.surname,
      email: row.email,
      father_name: row.father_name,
      occupation: row.occupation,
      category: row.category,
      religion: row.religion,
      subcast: row.subcast,
      image_url: row.image_url,
      github_url: row.github_url,
      twitter_url: row.twitter_url,
      linkedin_url: row.linkedin_url,
      instagram_url: row.instagram_url
    }));

    const { error } = await supabase.from('student_data').insert(rows);

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: 'Data imported successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});