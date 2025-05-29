
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    // Check database connection
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Simple database query to check connectivity
    const { data, error } = await supabase
      .from('wallet_analyses')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Database health check failed:', error);
      return new Response(
        JSON.stringify({ 
          status: 'unhealthy', 
          database: 'error',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check external API connectivity
    const etherscanKey = Deno.env.get('ETHERSCAN_API_KEY');
    let etherscanStatus = 'not_configured';
    
    if (etherscanKey) {
      try {
        const testResponse = await fetch(
          `https://api.etherscan.io/api?module=stats&action=ethsupply&apikey=${etherscanKey}`,
          { signal: AbortSignal.timeout(5000) }
        );
        etherscanStatus = testResponse.ok ? 'healthy' : 'error';
      } catch {
        etherscanStatus = 'error';
      }
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const geminiStatus = geminiKey ? 'configured' : 'not_configured';

    return new Response(
      JSON.stringify({
        status: 'healthy',
        database: 'connected',
        apis: {
          etherscan: etherscanStatus,
          gemini: geminiStatus
        },
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Health check error:', error);
    return new Response(
      JSON.stringify({ 
        status: 'unhealthy', 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
