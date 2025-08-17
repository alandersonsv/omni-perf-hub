import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleAdsConfig {
  customerId: string;
  refreshToken: string;
  accessToken: string;
  developerToken: string;
}

interface SyncRequest {
  agency_id: string;
  account_id: string;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
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

    const { agency_id, account_id, start_date, end_date }: SyncRequest = await req.json();

    // Default date range: last 30 days if not specified
    const endDate = end_date ? new Date(end_date) : new Date();
    const startDate = start_date ? new Date(start_date) : new Date(endDate);
    if (!start_date) {
      startDate.setDate(startDate.getDate() - 30);
    }

    console.log(`Google Ads sync for agency: ${agency_id}, account: ${account_id}`);
    console.log(`Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

    // Get integration credentials
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('credentials')
      .eq('agency_id', agency_id)
      .eq('platform', 'google_ads')
      .eq('account_id', account_id)
      .single();

    if (integrationError || !integration) {
      throw new Error(`Integration not found: ${integrationError?.message}`);
    }

    const credentials = integration.credentials as unknown as GoogleAdsConfig;
    if (!credentials || !credentials.accessToken || !credentials.refreshToken) {
      throw new Error('Invalid credentials');
    }

    // Check if token needs refresh
    const tokenExpiry = new Date(credentials.accessToken);
    if (tokenExpiry < new Date()) {
      // Refresh token logic would go here
      // For now, we'll just throw an error
      throw new Error('Token expired, refresh not implemented yet');
    }

    // Simulate API call to Google Ads API
    // In a real implementation, you would use the Google Ads API client library
    const campaignData = await simulateGoogleAdsApiCall(credentials, startDate, endDate);

    // Store campaign data in the database
    const { error: insertError } = await supabase
      .from('google_ads_campaigns_kpi')
      .upsert(
        campaignData.map(campaign => ({
          agency_id,
          account_id,
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          date: campaign.date,
          impressions: campaign.impressions,
          clicks: campaign.clicks,
          cost: campaign.cost,
          conversions: campaign.conversions,
          conversion_value: campaign.conversionValue
        }))
      );

    if (insertError) {
      throw new Error(`Failed to store campaign data: ${insertError.message}`);
    }

    // Update last_sync timestamp
    const { error: updateError } = await supabase
      .from('integrations')
      .update({ last_sync: new Date().toISOString() })
      .eq('agency_id', agency_id)
      .eq('platform', 'google_ads')
      .eq('account_id', account_id);

    if (updateError) {
      console.error('Failed to update last_sync:', updateError);
    }

    // Log sync success
    await supabase.from('google_ads_sync_log').insert({
      total_campaigns: campaignData.length,
      campaigns_synced: campaignData.length,
      sync_status: 'success',
      sync_timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Google Ads data synced successfully',
        campaigns_synced: campaignData.length,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Google Ads sync error:', error);

    // Log sync error
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabase.from('google_ads_sync_log').insert({
      sync_status: 'error',
      error_message: error.message,
      sync_timestamp: new Date().toISOString()
    });

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

// Simulate Google Ads API call (to be replaced with actual API call)
async function simulateGoogleAdsApiCall(credentials: GoogleAdsConfig, startDate: Date, endDate: Date) {
  // In a real implementation, you would use the Google Ads API client library
  // This is just a simulation for development purposes
  
  // Simulate API rate limiting and retry logic
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock data
      const campaigns = [];
      const numDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i < 5; i++) {
        const campaignId = `campaign-${i+1}`;
        const campaignName = `Campaign ${i+1}`;
        
        for (let j = 0; j < numDays; j++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + j);
          
          campaigns.push({
            id: campaignId,
            name: campaignName,
            date: date.toISOString().split('T')[0],
            impressions: Math.floor(Math.random() * 10000),
            clicks: Math.floor(Math.random() * 500),
            cost: Math.random() * 1000,
            conversions: Math.floor(Math.random() * 50),
            conversionValue: Math.random() * 5000
          });
        }
      }
      
      return campaigns;
    } catch (error) {
      retries++;
      
      // Implement exponential backoff
      const backoffTime = Math.pow(2, retries) * 1000;
      console.log(`API call failed, retrying in ${backoffTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      
      if (retries >= maxRetries) {
        throw new Error(`Failed after ${maxRetries} retries: ${error.message}`);
      }
    }
  }
  
  return [];
}