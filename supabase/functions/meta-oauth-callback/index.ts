import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MetaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface OAuthRequest {
  code: string;
  state: string;
  agency_id: string;
  redirect_uri: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { code, state, agency_id, redirect_uri }: OAuthRequest = await req.json();

    // Validate state parameter to prevent CSRF attacks
    const expectedState = await generateStateHash(agency_id, 'meta_ads');
    if (state !== expectedState) {
      throw new Error('Invalid state parameter. Possible CSRF attack.');
    }

    // Exchange authorization code for tokens
    const tokenResponse = await exchangeCodeForTokens(code, redirect_uri);
    
    // Get ad accounts information
    const adAccounts = await getAdAccounts(tokenResponse.access_token);
    
    // Store integration for each ad account
    const results = [];
    
    for (const account of adAccounts) {
      // Store the integration credentials in the database
      const credentials = {
        accessToken: tokenResponse.access_token,
        expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
        adAccountId: account.id,
        appId: Deno.env.get('META_APP_ID') ?? '',
        appSecret: Deno.env.get('META_APP_SECRET') ?? ''
      };

      // Upsert integration record
      const { error: upsertError } = await supabase
        .from('integrations')
        .upsert({
          agency_id,
          platform: 'meta_ads',
          account_id: account.id,
          credentials,
          is_active: true,
          last_sync: null
        }, {
          onConflict: 'agency_id,platform,account_id'
        });

      if (upsertError) {
        console.error(`Failed to store integration for account ${account.id}: ${upsertError.message}`);
        results.push({
          account_id: account.id,
          account_name: account.name,
          success: false,
          error: upsertError.message
        });
      } else {
        results.push({
          account_id: account.id,
          account_name: account.name,
          success: true
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Meta OAuth successful',
        accounts: results,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Meta OAuth error:', error);

    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

// Generate a hash for the state parameter to prevent CSRF attacks
async function generateStateHash(agency_id: string, platform: string): Promise<string> {
  const stateSecret = Deno.env.get('OAUTH_STATE_SECRET') ?? 'default_secret';
  const message = `${agency_id}:${platform}:${Date.now()}`;
  
  // In a real implementation, you would use a proper HMAC
  // This is a simplified version for development purposes
  const encoder = new TextEncoder();
  const data = encoder.encode(message + stateSecret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to hex string
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Exchange authorization code for tokens
async function exchangeCodeForTokens(
  code: string,
  redirect_uri: string
): Promise<MetaTokenResponse> {
  const appId = Deno.env.get('META_APP_ID');
  const appSecret = Deno.env.get('META_APP_SECRET');
  
  if (!appId || !appSecret) {
    throw new Error('Meta OAuth credentials not configured');
  }
  
  // In a real implementation, you would make an actual HTTP request to Meta's token endpoint
  // This is a simulation for development purposes
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate mock token response
  // In a real implementation, you would exchange the short-lived token for a long-lived token (60 days)
  return {
    access_token: `mock_meta_access_token_${Date.now()}`,
    token_type: 'bearer',
    expires_in: 5184000 // 60 days in seconds
  };
}

// Get ad accounts information
async function getAdAccounts(accessToken: string) {
  // In a real implementation, you would make API calls to get ad accounts
  // This is a simulation for development purposes
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate mock ad accounts
  return [
    {
      id: `act_${Math.floor(Math.random() * 1000000)}`,
      name: 'Main Ad Account'
    },
    {
      id: `act_${Math.floor(Math.random() * 1000000)}`,
      name: 'Secondary Ad Account'
    }
  ];
}