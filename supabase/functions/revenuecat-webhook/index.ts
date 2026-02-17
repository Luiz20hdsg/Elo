// =============================================================================
// Supabase Edge Function – RevenueCat Webhook Handler
// =============================================================================
// This function receives webhooks from RevenueCat when subscription events occur
// (new purchase, renewal, cancellation, expiration, billing issue, etc.)
// and syncs the subscription state to our Supabase `subscriptions` table.
//
// Deploy: supabase functions deploy revenuecat-webhook
// Set secret: supabase secrets set REVENUECAT_WEBHOOK_AUTH_KEY=<your-key>
//
// Configure in RevenueCat Dashboard:
//   URL: https://<project-ref>.supabase.co/functions/v1/revenuecat-webhook
//   Authorization: Bearer <REVENUECAT_WEBHOOK_AUTH_KEY>
// =============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// RevenueCat event types we care about
const SUBSCRIPTION_EVENTS = [
  'INITIAL_PURCHASE',
  'RENEWAL',
  'CANCELLATION',
  'UNCANCELLATION',
  'NON_RENEWING_PURCHASE',
  'SUBSCRIPTION_PAUSED',
  'EXPIRATION',
  'BILLING_ISSUE',
  'PRODUCT_CHANGE',
];

const CONSUMABLE_EVENTS = ['NON_RENEWING_PURCHASE'];

interface RevenueCatEvent {
  type: string;
  app_user_id: string;
  product_id: string;
  entitlement_ids?: string[];
  period_type?: string;
  purchased_at_ms?: number;
  expiration_at_ms?: number;
  store?: string;
  environment?: string;
  is_trial_conversion?: boolean;
  cancel_reason?: string;
  price_in_purchased_currency?: number;
  currency?: string;
  transaction_id?: string;
}

interface RevenueCatWebhookBody {
  api_version: string;
  event: RevenueCatEvent;
}

serve(async (req: Request) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Verify authorization
  const authHeader = req.headers.get('Authorization');
  const expectedKey = Deno.env.get('REVENUECAT_WEBHOOK_AUTH_KEY');

  if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
    console.error('Unauthorized webhook request');
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body: RevenueCatWebhookBody = await req.json();
    const event = body.event;

    console.log(`[RC Webhook] Event: ${event.type} | User: ${event.app_user_id} | Product: ${event.product_id}`);

    // Skip sandbox events in production (optional)
    // if (event.environment === 'SANDBOX') {
    //   return new Response(JSON.stringify({ status: 'skipped_sandbox' }), { status: 200 });
    // }

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const userId = event.app_user_id;

    // Determine plan from entitlements
    let plan: 'free' | 'light' | 'premium_plus' = 'free';
    if (event.entitlement_ids?.includes('premium_plus')) {
      plan = 'premium_plus';
    } else if (event.entitlement_ids?.includes('light')) {
      plan = 'light';
    } else {
      // Try to infer from product_id
      if (event.product_id?.includes('premium') || event.product_id?.includes('plus')) {
        plan = 'premium_plus';
      } else if (event.product_id?.includes('light')) {
        plan = 'light';
      }
    }

    // Determine status
    let status: string = 'active';
    switch (event.type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'UNCANCELLATION':
        status = event.period_type === 'TRIAL' ? 'trial' : 'active';
        break;
      case 'CANCELLATION':
        status = 'cancelled'; // Still active until expiration
        break;
      case 'EXPIRATION':
        status = 'expired';
        plan = 'free';
        break;
      case 'BILLING_ISSUE':
        status = 'grace_period';
        break;
      case 'SUBSCRIPTION_PAUSED':
        status = 'expired';
        plan = 'free';
        break;
    }

    // Determine provider
    let provider: string = 'apple';
    if (event.store === 'PLAY_STORE') {
      provider = 'google';
    } else if (event.store === 'STRIPE') {
      provider = 'stripe';
    }

    // Parse dates
    const periodStart = event.purchased_at_ms
      ? new Date(event.purchased_at_ms).toISOString()
      : new Date().toISOString();

    const periodEnd = event.expiration_at_ms
      ? new Date(event.expiration_at_ms).toISOString()
      : null;

    // ======== Subscription events ========
    if (SUBSCRIPTION_EVENTS.includes(event.type)) {
      // Use our existing RPC function
      const { error } = await supabase.rpc('update_subscription', {
        p_user_id: userId,
        p_plan: plan,
        p_status: status,
        p_provider: provider,
        p_provider_subscription_id: event.transaction_id ?? event.product_id,
        p_period_start: periodStart,
        p_period_end: periodEnd,
      });

      if (error) {
        console.error('[RC Webhook] update_subscription error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      }

      console.log(`[RC Webhook] Updated subscription: ${userId} → ${plan} (${status})`);
    }

    // ======== Record purchase history ========
    const { error: historyError } = await supabase.from('purchase_history').insert({
      user_id: userId,
      product_id: event.product_id,
      type: event.entitlement_ids?.length ? 'subscription' : 'consumable',
      plan: plan !== 'free' ? plan : null,
      amount_cents: event.price_in_purchased_currency
        ? Math.round(event.price_in_purchased_currency * 100)
        : null,
      currency: event.currency ?? 'BRL',
      provider: provider,
      provider_transaction_id: event.transaction_id ?? null,
      status: event.type === 'EXPIRATION' ? 'refunded' : 'completed',
    });

    if (historyError) {
      console.error('[RC Webhook] purchase_history insert error:', historyError);
    }

    return new Response(
      JSON.stringify({
        status: 'ok',
        event_type: event.type,
        user_id: userId,
        plan,
        subscription_status: status,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    console.error('[RC Webhook] Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 },
    );
  }
});
