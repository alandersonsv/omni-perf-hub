
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

type Json = Record<string, unknown> | null;

// Helpers
const toIso = (unix?: number | null): string | null =>
  typeof unix === "number" ? new Date(unix * 1000).toISOString() : null;

const determineTier = (unitAmount?: number | null): string | null => {
  if (!unitAmount && unitAmount !== 0) return null;
  if (unitAmount <= 999) return "Basic";
  if (unitAmount <= 1999) return "Premium";
  return "Enterprise";
};

const getEmailFromStripeObj = (obj: any): string | null => {
  // Try common locations
  return (
    obj?.customer_details?.email ||
    obj?.customer_email ||
    obj?.receipt_email ||
    null
  );
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY") ?? "";

  // Admin client (bypasses RLS for secure writes from trusted function)
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });

  let event: Stripe.Event;

  // Stripe requires the raw body for signature verification
  const signature = req.headers.get("stripe-signature") || "";
  const body = await req.text();

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[STRIPE-WEBHOOK] Invalid signature", err);
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }

  console.log("[STRIPE-WEBHOOK] Received event:", event.type);

  // Always try to log the event (best-effort)
  const logEvent = async (type: string, stripeObjectId?: string | null, email?: string | null, payload?: Json) => {
    try {
      const { error } = await supabaseAdmin.from("billing_events").insert({
        type,
        stripe_object_id: stripeObjectId ?? null,
        email: email ?? null,
        payload: payload ?? null,
        created_at: new Date().toISOString(),
      });
      if (error) console.error("[STRIPE-WEBHOOK] Error logging billing_event:", error);
    } catch (e) {
      console.error("[STRIPE-WEBHOOK] Exception logging billing_event:", e);
    }
  };

  // Small helpers for DB writes without needing unique constraints
  const upsertSubscriberByEmail = async (email: string, values: Record<string, any>) => {
    // Try update first
    const { data: found, error: findErr } = await supabaseAdmin
      .from("subscribers")
      .select("id")
      .eq("email", email)
      .limit(1)
      .maybeSingle();

    if (findErr) {
      console.error("[STRIPE-WEBHOOK] subscribers findErr:", findErr);
    }

    if (found?.id) {
      const { error: updErr } = await supabaseAdmin
        .from("subscribers")
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq("id", found.id);
      if (updErr) console.error("[STRIPE-WEBHOOK] subscribers update error:", updErr);
      return;
    }

    const { error: insErr } = await supabaseAdmin.from("subscribers").insert({
      email,
      ...values,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (insErr) console.error("[STRIPE-WEBHOOK] subscribers insert error:", insErr);
  };

  const upsertInvoiceByStripeId = async (invoiceId: string, values: Record<string, any>) => {
    const { data: found, error: findErr } = await supabaseAdmin
      .from("invoices")
      .select("id")
      .eq("stripe_invoice_id", invoiceId)
      .limit(1)
      .maybeSingle();

    if (findErr) {
      console.error("[STRIPE-WEBHOOK] invoices findErr:", findErr);
    }

    if (found?.id) {
      const { error: updErr } = await supabaseAdmin
        .from("invoices")
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq("id", found.id);
      if (updErr) console.error("[STRIPE-WEBHOOK] invoices update error:", updErr);
      return;
    }

    const { error: insErr } = await supabaseAdmin.from("invoices").insert({
      stripe_invoice_id: invoiceId,
      ...values,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (insErr) console.error("[STRIPE-WEBHOOK] invoices insert error:", insErr);
  };

  // Process events
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = getEmailFromStripeObj(session);
        const stripeObjectId = session.id;

        await logEvent(event.type, stripeObjectId, email, event as unknown as Json);

        if (session.mode === "subscription" && email) {
          let sub: Stripe.Subscription | null = null;
          const subscriptionId = session.subscription as string | undefined;
          if (subscriptionId) {
            try {
              sub = await stripe.subscriptions.retrieve(subscriptionId);
            } catch (e) {
              console.error("[STRIPE-WEBHOOK] Failed to retrieve subscription:", e);
            }
          }

          const unitAmount = sub?.items?.data?.[0]?.price?.unit_amount ?? null;
          const subscriptionEnd = toIso(sub?.current_period_end ?? null);
          const tier = determineTier(unitAmount);

          await upsertSubscriberByEmail(email, {
            subscribed: true,
            subscription_tier: tier,
            subscription_end: subscriptionEnd,
            stripe_customer_id: typeof sub?.customer === "string" ? sub?.customer : (sub?.customer as any)?.id ?? null,
          });
        }

        // For one-off payments via Checkout, you could also handle here if needed.
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        // Email may not be directly on subscription
        let email: string | null = null;

        // Try to fetch customer email if not present
        if (typeof subscription.customer === "string") {
          try {
            const customer = await stripe.customers.retrieve(subscription.customer);
            email = (customer as any)?.email ?? null;
          } catch (e) {
            console.error("[STRIPE-WEBHOOK] Failed to retrieve customer:", e);
          }
        }

        const status = subscription.status; // 'active', 'trialing', 'past_due', 'canceled', etc.
        const subscribed = status === "active" || status === "trialing";
        const unitAmount = subscription.items?.data?.[0]?.price?.unit_amount ?? null;
        const subscriptionEnd = toIso(subscription.current_period_end ?? null);
        const tier = determineTier(unitAmount);

        await logEvent(event.type, subscription.id, email, event as unknown as Json);

        if (email) {
          await upsertSubscriberByEmail(email, {
            subscribed,
            subscription_tier: tier,
            subscription_end: subscriptionEnd,
            stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : (subscription.customer as any)?.id ?? null,
          });
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        let email: string | null = null;

        if (typeof subscription.customer === "string") {
          try {
            const customer = await stripe.customers.retrieve(subscription.customer);
            email = (customer as any)?.email ?? null;
          } catch (e) {
            console.error("[STRIPE-WEBHOOK] Failed to retrieve customer:", e);
          }
        }

        await logEvent(event.type, subscription.id, email, event as unknown as Json);

        if (email) {
          await upsertSubscriberByEmail(email, {
            subscribed: false,
            subscription_tier: null,
            subscription_end: toIso(subscription.current_period_end ?? null),
            stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : (subscription.customer as any)?.id ?? null,
          });
        }

        break;
      }

      case "invoice.finalized":
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
      case "invoice.paid":
      case "invoice.updated": {
        const invoice = event.data.object as Stripe.Invoice;
        const email = getEmailFromStripeObj(invoice);
        const stripeObjectId = invoice.id;

        await logEvent(event.type, stripeObjectId, email, event as unknown as Json);

        const values = {
          email: email ?? null,
          period_start: toIso(invoice.period_start),
          period_end: toIso(invoice.period_end),
          amount_cents: invoice.amount_paid ?? invoice.amount_due ?? invoice.total ?? null,
          currency: invoice.currency ?? "usd",
          status: invoice.status ?? null,
          hosted_invoice_url: invoice.hosted_invoice_url ?? null,
          // user_id intentionally left null (we don't map Stripe customer to auth.user automatically here)
        };

        await upsertInvoiceByStripeId(invoice.id, values);
        break;
      }

      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const email = pi.receipt_email ?? null;
        await logEvent(event.type, pi.id, email, event as unknown as Json);
        break;
      }

      default: {
        // Log everything else for auditing
        const obj: any = event.data?.object ?? {};
        const email = getEmailFromStripeObj(obj);
        const id = typeof obj?.id === "string" ? obj.id : null;
        await logEvent(event.type, id, email, event as unknown as Json);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[STRIPE-WEBHOOK] Handler error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
