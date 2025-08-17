import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  agency_id: string;
  account_id: string;
  event_type: string;
  data: Record<string, any>;
  signature: string;
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

    const payload: WebhookPayload = await req.json();

    // Validate webhook signature
    const isValid = await validateSignature(req, payload.signature);
    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    console.log(`Received Meta Ads webhook: ${payload.event_type} for agency: ${payload.agency_id}, account: ${payload.account_id}`);

    // Process the webhook based on event type
    switch (payload.event_type) {
      case 'AD_UPDATED':
        await processAdUpdate(supabase, payload);
        break;
        
      case 'AD_CREATED':
        await processAdCreate(supabase, payload);
        break;
        
      case 'AD_REMOVED':
        await processAdRemove(supabase, payload);
        break;
        
      case 'ADSET_UPDATED':
        await processAdSetUpdate(supabase, payload);
        break;
        
      case 'CAMPAIGN_UPDATED':
        await processCampaignUpdate(supabase, payload);
        break;
        
      default:
        console.log(`Unhandled event type: ${payload.event_type}`);
    }

    // Log the webhook event
    await logWebhookEvent(supabase, payload);

    // Trigger a sync if needed
    if (['AD_UPDATED', 'AD_CREATED', 'AD_REMOVED', 'ADSET_UPDATED', 'CAMPAIGN_UPDATED'].includes(payload.event_type)) {
      await triggerSync(supabase, payload.agency_id, payload.account_id);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Webhook processed successfully',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Meta Ads webhook error:', error);

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

// Validate webhook signature using HMAC
async function validateSignature(req: Request, signature: string): Promise<boolean> {
  // In a real implementation, you would validate the signature using HMAC
  // This is a simplified version for development purposes
  
  const webhookSecret = Deno.env.get('META_WEBHOOK_SECRET') ?? 'default_secret';
  
  // For development, always return true
  // In production, implement proper HMAC validation
  return true;
}

// Process ad update event
async function processAdUpdate(supabase: any, payload: WebhookPayload) {
  const { agency_id, account_id, data } = payload;
  
  if (!data.ad_id) {
    throw new Error('Missing ad_id in webhook payload');
  }
  
  // In a real implementation, you would update ad data in the database
  // This is a simplified version for development purposes
  console.log(`Processing ad update for ad_id: ${data.ad_id}`);
}

// Process ad create event
async function processAdCreate(supabase: any, payload: WebhookPayload) {
  const { agency_id, account_id, data } = payload;
  
  if (!data.ad_id) {
    throw new Error('Missing ad_id in webhook payload');
  }
  
  // In a real implementation, you would insert new ad data in the database
  // This is a simplified version for development purposes
  console.log(`Processing ad creation for ad_id: ${data.ad_id}`);
}

// Process ad remove event
async function processAdRemove(supabase: any, payload: WebhookPayload) {
  const { agency_id, account_id, data } = payload;
  
  if (!data.ad_id) {
    throw new Error('Missing ad_id in webhook payload');
  }
  
  // In a real implementation, you would update ad status to REMOVED in the database
  // This is a simplified version for development purposes
  console.log(`Processing ad removal for ad_id: ${data.ad_id}`);
}

// Process ad set update event
async function processAdSetUpdate(supabase: any, payload: WebhookPayload) {
  const { agency_id, account_id, data } = payload;
  
  if (!data.adset_id) {
    throw new Error('Missing adset_id in webhook payload');
  }
  
  // In a real implementation, you would update ad set data in the database
  // This is a simplified version for development purposes
  console.log(`Processing ad set update for adset_id: ${data.adset_id}`);
}

// Process campaign update event
async function processCampaignUpdate(supabase: any, payload: WebhookPayload) {
  const { agency_id, account_id, data } = payload;
  
  if (!data.campaign_id) {
    throw new Error('Missing campaign_id in webhook payload');
  }
  
  // In a real implementation, you would update campaign data in the database
  // This is a simplified version for development purposes
  console.log(`Processing campaign update for campaign_id: ${data.campaign_id}`);
}

// Log webhook event
async function logWebhookEvent(supabase: any, payload: WebhookPayload) {
  const { error } = await supabase
    .from('webhook_logs')
    .insert({
      agency_id: payload.agency_id,
      platform: 'meta_ads',
      account_id: payload.account_id,
      event_type: payload.event_type,
      payload: payload.data,
      created_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Failed to log webhook event:', error);
  }
}

// Trigger a sync after webhook event
async function triggerSync(supabase: any, agency_id: string, account_id: string) {
  try {
    // In a real implementation, you would trigger a sync job
    // This is a simplified version for development purposes
    
    // Update last_sync timestamp
    const { error } = await supabase
      .from('integrations')
      .update({ 
        last_sync: new Date().toISOString(),
        sync_status: 'pending'
      })
      .eq('agency_id', agency_id)
      .eq('platform', 'meta_ads')
      .eq('account_id', account_id);
    
    if (error) {
      console.error('Failed to update sync status:', error);
    }
    
    // In a real implementation, you would trigger an external job or queue
    // For example, using a message queue or a webhook to N8N
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    if (n8nWebhookUrl) {
      // Simulate webhook call to N8N
      console.log(`Would trigger N8N webhook for agency: ${agency_id}, account: ${account_id}`);
    }
    
  } catch (error) {
    console.error('Failed to trigger sync:', error);
  }
}