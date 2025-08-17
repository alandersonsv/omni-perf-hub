import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchConsoleConfig {
  siteUrl: string;
  accessToken: string;
  refreshToken: string;
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

    console.log(`Search Console sync for agency: ${agency_id}, account: ${account_id}`);
    console.log(`Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

    // Get integration credentials
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('credentials')
      .eq('agency_id', agency_id)
      .eq('platform', 'search_console')
      .eq('account_id', account_id)
      .single();

    if (integrationError || !integration) {
      throw new Error(`Integration not found: ${integrationError?.message}`);
    }

    const credentials = integration.credentials as unknown as SearchConsoleConfig;
    if (!credentials || !credentials.accessToken || !credentials.refreshToken || !credentials.siteUrl) {
      throw new Error('Invalid credentials');
    }

    // Fetch Search Console data
    const searchData = await fetchSearchConsoleData(
      credentials,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    // Store search data in the database
    for (const batch of chunkArray(searchData, 100)) { // Process in batches of 100
      const { error: insertError } = await supabase
        .from('search_console_pages_daily')
        .upsert(
          batch.map(data => ({
            agency_id,
            site_url: credentials.siteUrl,
            page: data.page,
            date: data.date,
            clicks: data.clicks,
            impressions: data.impressions,
            ctr: data.ctr,
            position: data.position
          }))
        );

      if (insertError) {
        throw new Error(`Failed to store Search Console data: ${insertError.message}`);
      }
    }

    // Update last_sync timestamp
    const { error: updateError } = await supabase
      .from('integrations')
      .update({ last_sync: new Date().toISOString() })
      .eq('agency_id', agency_id)
      .eq('platform', 'search_console')
      .eq('account_id', account_id);

    if (updateError) {
      console.error('Failed to update last_sync:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Search Console data synced successfully',
        pages_synced: searchData.length,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Search Console sync error:', error);

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

// Fetch data from Search Console API
async function fetchSearchConsoleData(credentials: SearchConsoleConfig, startDate: string, endDate: string) {
  // In a real implementation, you would use the Search Console API
  // This is just a simulation for development purposes
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate mock data
    const searchData = [];
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const numDays = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    // Sample pages
    const pages = [
      '/',
      '/about',
      '/products',
      '/blog',
      '/contact',
      '/services',
      '/blog/post-1',
      '/blog/post-2',
      '/products/category-1',
      '/products/category-2'
    ];
    
    // Generate data for each page and each day
    for (const page of pages) {
      for (let i = 0; i < numDays; i++) {
        const date = new Date(startDateObj);
        date.setDate(date.getDate() + i);
        
        const impressions = Math.floor(Math.random() * 500) + 10;
        const clicks = Math.floor(impressions * (Math.random() * 0.2 + 0.01)); // 1-21% CTR
        const ctr = clicks / impressions;
        const position = Math.random() * 20 + 1; // Position 1-21
        
        searchData.push({
          page,
          date: date.toISOString().split('T')[0],
          clicks,
          impressions,
          ctr,
          position
        });
      }
    }
    
    return searchData;
    
  } catch (error) {
    console.error('Error fetching Search Console data:', error);
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