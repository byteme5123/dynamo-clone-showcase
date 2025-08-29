import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayPalOrder {
  intent: string;
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
    };
    description: string;
  }>;
  application_context: {
    return_url: string;
    cancel_url: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { planId, amount, currency = 'USD', returnUrl, cancelUrl, userId, customerEmail } = await req.json();

    console.log('Creating PayPal order for plan:', planId, 'amount:', amount);

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

    console.log('PayPal access token obtained');

    // Get plan details
    const { data: plan, error: planError } = await supabaseClient
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      throw new Error('Plan not found');
    }

    // Create PayPal order
    const orderData: PayPalOrder = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toString(),
        },
        description: `${plan.name} - ${plan.description || 'Mobile Plan'}`,
      }],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    };

    const createOrderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    });

    const orderResult = await createOrderResponse.json();
    console.log('PayPal order created:', orderResult.id);

    // Get user info if authenticated
    let userId = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data } = await supabaseClient.auth.getUser(token);
      userId = data.user?.id || null;
    }

    // Store order in database
    const { error: insertError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: userId || null,
        plan_id: planId,
        paypal_order_id: orderResult.id,
        amount: parseFloat(amount),
        currency: currency,
        status: 'pending',
        customer_email: customerEmail || null,
      });

    if (insertError) {
      console.error('Error storing order:', insertError);
    }

    return new Response(JSON.stringify({
      orderId: orderResult.id,
      approvalUrl: orderResult.links.find((link: any) => link.rel === 'approve')?.href,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to create PayPal order' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});