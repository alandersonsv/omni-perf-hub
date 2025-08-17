import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MetaAdsConfig {
  accessToken: string;
  adAccountId: string;
  appId: string;
  appSecret: string;
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

    console.log(`Meta Ads sync for agency: ${agency_id}, account: ${account_id}`);
    console.log(`Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

    // Get integration credentials
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('credentials')
      .eq('agency_id', agency_id)
      .eq('platform', 'meta_ads')
      .eq('account_id', account_id)
      .single();

    if (integrationError || !integration) {
      throw new Error(`Integration not found: ${integrationError?.message}`);
    }

    const credentials = integration.credentials as unknown as MetaAdsConfig;
    if (!credentials || !credentials.accessToken) {
      throw new Error('Invalid credentials');
    }

    // Fetch insights data from Meta Marketing API
    const insightsData = await fetchMetaAdsInsights(
      credentials,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    // Store insights data in the database
    for (const batch of chunkArray(insightsData, 100)) { // Process in batches of 100
      const { error: insertError } = await supabase
        .from('meta_ads_insights_daily')
        .upsert(
          batch.map(insight => ({
            agency_id,
            account_id,
            campaign_id: insight.campaign_id,
            adset_id: insight.adset_id,
            ad_id: insight.ad_id,
            date: insight.date,
            impressions: insight.impressions,
            clicks: insight.clicks,
            spend: insight.spend,
            conversions: insight.conversions,
            revenue: insight.revenue,
            cpc: insight.clicks > 0 ? insight.spend / insight.clicks : 0,
            cpa: insight.conversions > 0 ? insight.spend / insight.conversions : 0,
            roas: insight.spend > 0 ? insight.revenue / insight.spend : 0
          }))
        );

      if (insertError) {
        throw new Error(`Failed to store insights data: ${insertError.message}`);
      }
    }

    // Update last_sync timestamp
    const { error: updateError } = await supabase
      .from('integrations')
      .update({ last_sync: new Date().toISOString() })
      .eq('agency_id', agency_id)
      .eq('platform', 'meta_ads')
      .eq('account_id', account_id);

    if (updateError) {
      console.error('Failed to update last_sync:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Meta Ads data synced successfully',
        insights_synced: insightsData.length,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Meta Ads sync error:', error);

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

// Fetch insights data from Meta Marketing API
async function fetchMetaAdsInsights(credentials: MetaAdsConfig, startDate: string, endDate: string) {
  // In a real implementation, you would use the Meta Marketing API
  // This is just a simulation for development purposes
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate mock data
    const insights = [];
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const numDays = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    // Simulate 3 campaigns, each with 2 ad sets, each with 2 ads
    for (let campaignIdx = 0; campaignIdx < 3; campaignIdx++) {
      const campaignId = `campaign-${campaignIdx+1}`;
      
      for (let adsetIdx = 0; adsetIdx < 2; adsetIdx++) {
        const adsetId = `adset-${campaignIdx+1}-${adsetIdx+1}`;
        
        for (let adIdx = 0; adIdx < 2; adIdx++) {
          const adId = `ad-${campaignIdx+1}-${adsetIdx+1}-${adIdx+1}`;
          
          // Generate data for each day in the date range
          for (let dayIdx = 0; dayIdx < numDays; dayIdx++) {
            const date = new Date(startDateObj);
            date.setDate(date.getDate() + dayIdx);
            
            const impressions = Math.floor(Math.random() * 5000) + 100;
            const clicks = Math.floor(impressions * (Math.random() * 0.1 + 0.01)); // 1-11% CTR
            const spend = clicks * (Math.random() * 1.5 + 0.5); // $0.50-$2.00 CPC
            const conversions = Math.floor(clicks * (Math.random() * 0.2 + 0.05)); // 5-25% conversion rate
            const revenue = conversions * (Math.random() * 100 + 50); // $50-$150 per conversion
            
            insights.push({
              campaign_id: campaignId,
              adset_id: adsetId,
              ad_id: adId,
              date: date.toISOString().split('T')[0],
              impressions,
              clicks,
              spend,
              conversions,
              revenue
            });
          }
        }
      }
    }
    
    // Implement pagination for large datasets
    // This is a simplified version, in a real implementation you would use cursor-based pagination
    return insights;
    
  } catch (error) {
    console.error('Error fetching Meta Ads insights:', error);
    throw error;
  }
}

// Helper function to chunk array into smaller batches
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}