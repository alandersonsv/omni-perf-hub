import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppMessage {
  phone_number: string;
  message: string;
  report_id?: string;
  alert_id?: string;
  type: 'report' | 'alert' | 'test';
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

    const { phone_number, message, report_id, alert_id, type }: WhatsAppMessage = await req.json();

    console.log(`Sending WhatsApp message to ${phone_number} - Type: ${type}`);

    // Get Evolution API configuration from secrets
    const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');
    const evolutionInstance = Deno.env.get('EVOLUTION_INSTANCE_NAME');

    if (!evolutionApiUrl || !evolutionApiKey || !evolutionInstance) {
      throw new Error('Evolution API configuration missing');
    }

    // Format phone number (remove non-digits and ensure country code)
    const formattedPhone = phone_number.replace(/\D/g, '');
    const finalPhone = formattedPhone.startsWith('55') ? formattedPhone : `55${formattedPhone}`;

    // Send message via Evolution API
    const evolutionResponse = await fetch(`${evolutionApiUrl}/message/sendText/${evolutionInstance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey,
      },
      body: JSON.stringify({
        number: `${finalPhone}@s.whatsapp.net`,
        text: message,
      }),
    });

    const evolutionResult = await evolutionResponse.json();

    if (!evolutionResponse.ok) {
      console.error('Evolution API error:', evolutionResult);
      throw new Error(`Evolution API error: ${evolutionResult.message || 'Unknown error'}`);
    }

    console.log('WhatsApp message sent successfully:', evolutionResult);

    // Log the message in database
    const { error: logError } = await supabase
      .from('whatsapp_messages_log')
      .insert({
        phone_number: finalPhone,
        message,
        report_id,
        alert_id,
        type,
        status: 'sent',
        evolution_message_id: evolutionResult.key?.id,
        sent_at: new Date().toISOString(),
      });

    if (logError) {
      console.error('Error logging message:', logError);
    }

    // Update report/alert last sent timestamp if applicable
    if (report_id) {
      await supabase
        .from('reports_config')
        .update({ last_sent_at: new Date().toISOString() })
        .eq('id', report_id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'WhatsApp message sent successfully',
        evolution_response: evolutionResult,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('WhatsApp sender error:', error);

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