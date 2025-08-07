import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OAuthRequest {
  platform: 'meta_ads' | 'google_ads' | 'ga4' | 'search_console';
  action: 'start' | 'callback';
  code?: string;
  state?: string;
  agency_id: string;
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

    const { platform, action, code, state, agency_id }: OAuthRequest = await req.json();

    console.log(`OAuth ${action} for platform: ${platform}, agency: ${agency_id}`);

    if (action === 'start') {
      // Generate OAuth URL for the platform
      const oauthUrl = await generateOAuthUrl(platform, agency_id);
      
      return new Response(
        JSON.stringify({ 
          oauth_url: oauthUrl,
          state: agency_id,
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );

    } else if (action === 'callback') {
      // Handle OAuth callback and exchange code for tokens
      const tokens = await exchangeCodeForTokens(platform, code!, state!);
      
      // Store integration credentials
      const { error } = await supabase
        .from('integrations')
        .upsert({
          agency_id,
          platform,
          account_id: tokens.account_id,
          credentials: {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: tokens.expires_at,
          },
          is_active: true,
          last_sync: new Date().toISOString(),
        }, {
          onConflict: 'agency_id,platform'
        });

      if (error) {
        console.error('Error storing integration:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Integration connected successfully',
          platform,
          account_id: tokens.account_id,
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('OAuth error:', error);

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

async function generateOAuthUrl(platform: string, agencyId: string): Promise<string> {
  const baseUrl = Deno.env.get('SUPABASE_URL');
  const redirectUri = `${baseUrl}/functions/v1/integration-oauth`;

  switch (platform) {
    case 'meta_ads':
      const metaClientId = Deno.env.get('META_CLIENT_ID');
      return `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${metaClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=ads_management,ads_read&` +
        `state=${agencyId}&` +
        `response_type=code`;

    case 'google_ads':
    case 'ga4':
    case 'search_console':
      const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const scopes = platform === 'google_ads' 
        ? 'https://www.googleapis.com/auth/adwords'
        : platform === 'ga4'
        ? 'https://www.googleapis.com/auth/analytics.readonly'
        : 'https://www.googleapis.com/auth/webmasters.readonly';
        
      return `https://accounts.google.com/o/oauth2/auth?` +
        `client_id=${googleClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `state=${agencyId}-${platform}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;

    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

async function exchangeCodeForTokens(platform: string, code: string, state: string) {
  const baseUrl = Deno.env.get('SUPABASE_URL');
  const redirectUri = `${baseUrl}/functions/v1/integration-oauth`;

  switch (platform) {
    case 'meta_ads':
      const metaClientId = Deno.env.get('META_CLIENT_ID');
      const metaClientSecret = Deno.env.get('META_CLIENT_SECRET');
      
      const metaResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: metaClientId!,
          client_secret: metaClientSecret!,
          redirect_uri: redirectUri,
          code,
        }),
      });

      const metaTokens = await metaResponse.json();
      if (!metaResponse.ok) throw new Error(metaTokens.error?.message || 'Meta OAuth error');

      // Get account info
      const metaAccountResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/adaccounts?access_token=${metaTokens.access_token}`
      );
      const metaAccounts = await metaAccountResponse.json();

      return {
        access_token: metaTokens.access_token,
        refresh_token: null,
        expires_at: new Date(Date.now() + (metaTokens.expires_in * 1000)).toISOString(),
        account_id: metaAccounts.data?.[0]?.id || 'unknown',
      };

    case 'google_ads':
    case 'ga4':
    case 'search_console':
      const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
      
      const googleResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: googleClientId!,
          client_secret: googleClientSecret!,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          code,
        }),
      });

      const googleTokens = await googleResponse.json();
      if (!googleResponse.ok) throw new Error(googleTokens.error_description || 'Google OAuth error');

      return {
        access_token: googleTokens.access_token,
        refresh_token: googleTokens.refresh_token,
        expires_at: new Date(Date.now() + (googleTokens.expires_in * 1000)).toISOString(),
        account_id: 'google_account', // Would need additional API call to get actual account ID
      };

    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}