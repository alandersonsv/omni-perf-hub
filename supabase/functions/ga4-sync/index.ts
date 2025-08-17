import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GA4Config {
  propertyId: string;
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

    console.log(`GA4 sync for agency: ${agency_id}, account: ${account_id}`);
    console.log(`Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

    // Get integration credentials
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('credentials')
      .eq('agency_id', agency_id)
      .eq('platform', 'ga4')
      .eq('account_id', account_id)
      .single();

    if (integrationError || !integration) {
      throw new Error(`Integration not found: ${integrationError?.message}`);
    }

    const credentials = integration.credentials as unknown as GA4Config;
    if (!credentials || !credentials.accessToken || !credentials.refreshToken || !credentials.propertyId) {
      throw new Error('Invalid credentials');
    }

    // Fetch GA4 data
    const analyticsData = await fetchGA4Data(
      credentials,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    // Store analytics data in the database
    const { error: insertError } = await supabase
      .from('ga4_daily')
      .upsert(
        analyticsData.map(data => ({
          agency_id,
          property_id: credentials.propertyId,
          date: data.date,
          sessions: data.sessions,
          users: data.users,
          new_users: data.newUsers,
          pageviews: data.pageviews,
          conversions: data.conversions,
          revenue: data.revenue,
          bounce_rate: data.bounceRate
        }))
      );

    if (insertError) {
      throw new Error(`Failed to store GA4 data: ${insertError.message}`);
    }

    // Update last_sync timestamp
    const { error: updateError } = await supabase
      .from('integrations')
      .update({ last_sync: new Date().toISOString() })
      .eq('agency_id', agency_id)
      .eq('platform', 'ga4')
      .eq('account_id', account_id);

    if (updateError) {
      console.error('Failed to update last_sync:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'GA4 data synced successfully',
        days_synced: analyticsData.length,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('GA4 sync error:', error);

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

// Fetch data from Google Analytics 4 API
async function fetchGA4Data(credentials: GA4Config, startDate: string, endDate: string) {
  // In a real implementation, you would use the Google Analytics Data API
  // This is just a simulation for development purposes
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate mock data
    const analyticsData = [];
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const numDays = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < numDays; i++) {
      const date = new Date(startDateObj);
      date.setDate(date.getDate() + i);
      
      const sessions = Math.floor(Math.random() * 1000) + 100;
      const users = Math.floor(sessions * 0.8);
      const newUsers = Math.floor(users * 0.3);
      const pageviews = Math.floor(sessions * (Math.random() * 3 + 2)); // 2-5 pages per session
      const conversions = Math.floor(sessions * (Math.random() * 0.05 + 0.01)); // 1-6% conversion rate
      const revenue = conversions * (Math.random() * 100 + 50); // $50-$150 per conversion
      const bounceRate = Math.random() * 0.3 + 0.3; // 30-60% bounce rate
      
      analyticsData.push({
        date: date.toISOString().split('T')[0],
        sessions,
        users,
        newUsers,
        pageviews,
        conversions,
        revenue,
        bounceRate
      });
    }
    
    return analyticsData;
    
  } catch (error) {
    console.error('Error fetching GA4 data:', error);
    throw error;
  }
}