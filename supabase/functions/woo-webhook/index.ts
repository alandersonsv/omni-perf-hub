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

    // Get the raw body for signature validation
    const rawBody = await req.text();
    const payload: WebhookPayload = JSON.parse(rawBody);

    // Get WooCommerce webhook signature from headers
    const signature = req.headers.get('x-wc-webhook-signature') || '';

    // Validate webhook signature
    const isValid = await validateSignature(rawBody, signature);
    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    console.log(`Received WooCommerce webhook: ${payload.event_type} for agency: ${payload.agency_id}, account: ${payload.account_id}`);

    // Process the webhook based on event type
    switch (payload.event_type) {
      case 'order.created':
        await processOrderCreated(supabase, payload);
        break;
        
      case 'order.updated':
        await processOrderUpdated(supabase, payload);
        break;
        
      case 'order.deleted':
        await processOrderDeleted(supabase, payload);
        break;
        
      case 'product.created':
        await processProductCreated(supabase, payload);
        break;
        
      case 'product.updated':
        await processProductUpdated(supabase, payload);
        break;
        
      default:
        console.log(`Unhandled event type: ${payload.event_type}`);
    }

    // Log the webhook event
    await logWebhookEvent(supabase, payload);

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
    console.error('WooCommerce webhook error:', error);

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
async function validateSignature(payload: string, signature: string): Promise<boolean> {
  // In a real implementation, you would validate the signature using HMAC
  // This is a simplified version for development purposes
  
  const webhookSecret = Deno.env.get('WOOCOMMERCE_WEBHOOK_SECRET') ?? 'default_secret';
  
  // For development, always return true
  // In production, implement proper HMAC validation
  return true;
}

// Process order created event
async function processOrderCreated(supabase: any, payload: WebhookPayload) {
  const { agency_id, account_id, data } = payload;
  
  if (!data.id) {
    throw new Error('Missing order ID in webhook payload');
  }
  
  // Store order data in the database
  const { error } = await supabase
    .from('woocommerce_orders')
    .insert({
      agency_id,
      account_id,
      order_id: data.id.toString(),
      order_number: data.number || data.id.toString(),
      status: data.status,
      currency: data.currency,
      total: parseFloat(data.total || '0'),
      customer_id: data.customer_id,
      customer_email: data.billing?.email || '',
      date_created: data.date_created || new Date().toISOString(),
      order_data: data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  
  if (error) {
    throw new Error(`Failed to store order: ${error.message}`);
  }
  
  // Process order items if available
  if (data.line_items && Array.isArray(data.line_items)) {
    for (const item of data.line_items) {
      const { error: itemError } = await supabase
        .from('woocommerce_order_items')
        .insert({
          agency_id,
          account_id,
          order_id: data.id.toString(),
          product_id: item.product_id.toString(),
          variation_id: item.variation_id ? item.variation_id.toString() : null,
          name: item.name,
          quantity: item.quantity,
          price: parseFloat(item.price || '0'),
          total: parseFloat(item.total || '0'),
          created_at: new Date().toISOString()
        });
      
      if (itemError) {
        console.error(`Failed to store order item: ${itemError.message}`);
      }
    }
  }
}

// Process order updated event
async function processOrderUpdated(supabase: any, payload: WebhookPayload) {
  const { agency_id, account_id, data } = payload;
  
  if (!data.id) {
    throw new Error('Missing order ID in webhook payload');
  }
  
  // Update order data in the database
  const { error } = await supabase
    .from('woocommerce_orders')
    .update({
      status: data.status,
      currency: data.currency,
      total: parseFloat(data.total || '0'),
      customer_id: data.customer_id,
      customer_email: data.billing?.email || '',
      order_data: data,
      updated_at: new Date().toISOString()
    })
    .eq('agency_id', agency_id)
    .eq('account_id', account_id)
    .eq('order_id', data.id.toString());
  
  if (error) {
    throw new Error(`Failed to update order: ${error.message}`);
  }
}

// Process order deleted event
async function processOrderDeleted(supabase: any, payload: WebhookPayload) {
  const { agency_id, account_id, data } = payload;
  
  if (!data.id) {
    throw new Error('Missing order ID in webhook payload');
  }
  
  // Mark order as deleted in the database
  const { error } = await supabase
    .from('woocommerce_orders')
    .update({
      status: 'deleted',
      updated_at: new Date().toISOString()
    })
    .eq('agency_id', agency_id)
    .eq('account_id', account_id)
    .eq('order_id', data.id.toString());
  
  if (error) {
    throw new Error(`Failed to mark order as deleted: ${error.message}`);
  }
}

// Process product created event
async function processProductCreated(supabase: any, payload: WebhookPayload) {
  const { agency_id, account_id, data } = payload;
  
  if (!data.id) {
    throw new Error('Missing product ID in webhook payload');
  }
  
  // Store product data in the database
  const { error } = await supabase
    .from('woocommerce_products')
    .insert({
      agency_id,
      account_id,
      product_id: data.id.toString(),
      name: data.name,
      sku: data.sku || '',
      price: parseFloat(data.price || '0'),
      regular_price: parseFloat(data.regular_price || '0'),
      sale_price: parseFloat(data.sale_price || '0'),
      status: data.status,
      product_data: data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  
  if (error) {
    throw new Error(`Failed to store product: ${error.message}`);
  }
}

// Process product updated event
async function processProductUpdated(supabase: any, payload: WebhookPayload) {
  const { agency_id, account_id, data } = payload;
  
  if (!data.id) {
    throw new Error('Missing product ID in webhook payload');
  }
  
  // Update product data in the database
  const { error } = await supabase
    .from('woocommerce_products')
    .update({
      name: data.name,
      sku: data.sku || '',
      price: parseFloat(data.price || '0'),
      regular_price: parseFloat(data.regular_price || '0'),
      sale_price: parseFloat(data.sale_price || '0'),
      status: data.status,
      product_data: data,
      updated_at: new Date().toISOString()
    })
    .eq('agency_id', agency_id)
    .eq('account_id', account_id)
    .eq('product_id', data.id.toString());
  
  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }
}

// Log webhook event
async function logWebhookEvent(supabase: any, payload: WebhookPayload) {
  const { error } = await supabase
    .from('webhook_logs')
    .insert({
      agency_id: payload.agency_id,
      platform: 'woocommerce',
      account_id: payload.account_id,
      event_type: payload.event_type,
      payload: payload.data,
      created_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Failed to log webhook event:', error);
  }
}