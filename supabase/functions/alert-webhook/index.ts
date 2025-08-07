import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertWebhookRequest {
  action: 'activate' | 'deactivate';
  alert_type: string;
  alert_id: string;
  webhook_url?: string;
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

    const { action, alert_type, alert_id, webhook_url }: AlertWebhookRequest = await req.json();

    console.log(`Alert webhook triggered: ${action} for ${alert_type} (${alert_id})`);

    // Update alert status in database
    const { error: updateError } = await supabase
      .from('alerts_config')
      .update({ 
        is_active: action === 'activate',
        updated_at: new Date().toISOString()
      })
      .eq('id', alert_id);

    if (updateError) {
      console.error('Error updating alert:', updateError);
      throw updateError;
    }

    // If external webhook URL is provided, trigger it
    if (webhook_url) {
      try {
        const webhookResponse = await fetch(webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action,
            alert_type,
            alert_id,
            timestamp: new Date().toISOString(),
            source: 'metrifiquei'
          }),
        });

        console.log(`External webhook called: ${webhook_url} - Status: ${webhookResponse.status}`);
      } catch (webhookError) {
        console.error('Error calling external webhook:', webhookError);
        // Don't throw here - we still want to return success for the main operation
      }
    }

    // Log the action for audit purposes
    const { error: logError } = await supabase
      .from('alert_webhook_logs')
      .insert({
        alert_id,
        action,
        webhook_url,
        triggered_at: new Date().toISOString(),
        status: 'success'
      });

    if (logError) {
      console.error('Error logging webhook action:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Alert ${action}d successfully`,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Alert webhook error:', error);

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