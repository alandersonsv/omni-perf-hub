import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

interface OAuthRequest {
  code: string;
  state: string;
  agency_id: string;
  platform: 'google_ads' | 'ga4' | 'search_console';
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

    const { code, state, agency_id, platform, redirect_uri }: OAuthRequest = await req.json();

    // Validate state parameter to prevent CSRF attacks
    const expectedState = await generateStateHash(agency_id, platform);
    if (state !== expectedState) {
      throw new Error('Invalid state parameter. Possible CSRF attack.');
    }

    // Exchange authorization code for tokens
    const tokenResponse = await exchangeCodeForTokens(code, redirect_uri, platform);
    
    // Get account information based on the platform
    const accountInfo = await getAccountInfo(tokenResponse.access_token, platform);
    
    // Store the integration credentials in the database
    const credentials = {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
      scope: tokenResponse.scope,
      ...accountInfo.additionalCredentials
    };

    // Upsert integration record
    const { error: upsertError } = await supabase
      .from('integrations')
      .upsert({
        agency_id,
        platform,
        account_id: accountInfo.accountId,
        credentials,
        is_active: true,
        last_sync: null
      }, {
        onConflict: 'agency_id,platform,account_id'
      });

    if (upsertError) {
      throw new Error(`Failed to store integration: ${upsertError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Google OAuth successful',
        platform,
        account_id: accountInfo.accountId,
        account_name: accountInfo.accountName,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Google OAuth error:', error);

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
  redirect_uri: string,
  platform: string
): Promise<GoogleTokenResponse> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured');
  }
  
  // In a real implementation, you would make an actual HTTP request to Google's token endpoint
  // This is a simulation for development purposes
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate mock token response
  return {
    access_token: `mock_access_token_${Date.now()}`,
    refresh_token: `mock_refresh_token_${Date.now()}`,
    expires_in: 3600,
    scope: getRequiredScope(platform)
  };
}

// Get account information based on the platform
async function getAccountInfo(accessToken: string, platform: string) {
  // In a real implementation, you would make API calls to get account information
  // This is a simulation for development purposes
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let accountId = '';
  let accountName = '';
  const additionalCredentials: Record<string, string> = {};
  
  switch (platform) {
    case 'google_ads':
      accountId = `ads-${Math.floor(Math.random() * 1000000)}`;
      accountName = 'My Google Ads Account';
      additionalCredentials.developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN') ?? 'mock_developer_token';
      additionalCredentials.customerId = accountId;
      break;
      
    case 'ga4':
      accountId = `ga4-${Math.floor(Math.random() * 1000000)}`;
      accountName = 'My GA4 Property';
      additionalCredentials.propertyId = accountId;
      break;
      
    case 'search_console':
      accountId = `sc-${Math.floor(Math.random() * 1000000)}`;
      accountName = 'example.com';
      additionalCredentials.siteUrl = 'https://example.com';
      break;
      
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
  
  return {
    accountId,
    accountName,
    additionalCredentials
  };
}

// Get required scope based on the platform
function getRequiredScope(platform: string): string {
  switch (platform) {
    case 'google_ads':
      return 'https://www.googleapis.com/auth/adwords';
      
    case 'ga4':
      return 'https://www.googleapis.com/auth/analytics.readonly';
      
    case 'search_console':
      return 'https://www.googleapis.com/auth/webmasters.readonly';
      
    default:
      return '';
  }
}