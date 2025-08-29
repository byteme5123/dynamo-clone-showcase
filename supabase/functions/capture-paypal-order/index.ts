import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { orderId } = await req.json();

    console.log('Capturing PayPal order:', orderId);

    // Get PayPal settings
    const { data: paypalSettings, error: settingsError } = await supabaseClient
      .from('paypal_settings')
      .select('*')
      .eq('is_active', true)
      .single();

    if (settingsError || !paypalSettings) {
      throw new Error('PayPal settings not found');
    }

    const clientId = paypalSettings.environment === 'sandbox' 
      ? paypalSettings.sandbox_client_id 
      : paypalSettings.live_client_id;
    const clientSecret = paypalSettings.environment === 'sandbox' 
      ? paypalSettings.sandbox_client_secret 
      : paypalSettings.live_client_secret;

    const baseUrl = paypalSettings.environment === 'sandbox' 
      ? 'https://api-m.sandbox.paypal.com' 
      : 'https://api-m.paypal.com';

    // Get access token
    const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: 'grant_type=client_credentials',
    });

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Capture the order
    const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const captureResult = await captureResponse.json();
    console.log('PayPal order captured:', captureResult);

    // Update order status in database using service role key
    const paymentId = captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    const status = captureResult.status === 'COMPLETED' ? 'paid' : 'failed';

    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get order details first
    const { data: order, error: orderError } = await supabaseService
      .from('orders')
      .select('user_id, plan_id, amount')
      .eq('paypal_order_id', orderId)
      .single();

    if (orderError) {
      console.error('Error finding order:', orderError);
    }

    // Update order status
    const { error: updateError } = await supabaseService
      .from('orders')
      .update({
        paypal_payment_id: paymentId,
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('paypal_order_id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
    }

    // Create transaction record if payment successful
    if (status === 'paid' && order) {
      const { error: transactionError } = await supabaseService
        .from('transactions')
        .insert({
          user_id: order.user_id,
          plan_id: order.plan_id,
          amount: order.amount,
          paypal_transaction_id: paymentId,
          paypal_order_id: orderId,
          status: 'completed',
          payment_method: 'PayPal',
        });

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
      }
    }

    return new Response(JSON.stringify({
      success: status === 'completed',
      paymentId: paymentId,
      status: status,
      details: captureResult,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to capture PayPal order' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});