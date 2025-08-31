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

    const { planId, amount, currency = 'USD', returnUrl, cancelUrl } = await req.json();

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

    // Get user info using custom session token
    let userId = null;
    let customerEmail = null;
    let customerName = null;

    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      console.log('Extracted token length:', token.length);
      
      // Try custom auth first (session token)
      const { data: session, error: sessionError } = await supabaseClient
        .from('user_sessions')
        .select('user_id')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      console.log('Session lookup result:', { session, sessionError });

      if (session) {
        console.log('Session found for user_id:', session.user_id);
        
        // Get user data
        const { data: userData, error: userError } = await supabaseClient
          .from('users')
          .select('id, email, first_name, last_name')
          .eq('id', session.user_id)
          .single();

        console.log('User lookup result:', { userData, userError });

        if (userData) {
          userId = userData.id;
          customerEmail = userData.email;
          customerName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
          console.log('User authenticated:', { userId, customerEmail, customerName });
        }
      } else {
        console.log('Session not found, trying Supabase auth fallback');
        // Fallback to Supabase auth
        const { data, error: authError } = await supabaseClient.auth.getUser(token);
        console.log('Supabase auth result:', { user: data.user, authError });
        userId = data.user?.id || null;
        customerEmail = data.user?.email || null;
      }
    } else {
      console.warn('No authorization header provided');
      throw new Error('Authentication required for payment');
    }

    // Use Supabase service role key to bypass RLS for order creation
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Validate we have user info before creating order
    if (!userId) {
      console.error('Cannot create order: user_id is null');
      throw new Error('User authentication failed. Please log in and try again.');
    }

    console.log('Creating order with user_id:', userId);

    // Store order in database
    const { error: insertError } = await supabaseService
      .from('orders')
      .insert({
        user_id: userId,
        plan_id: planId,
        paypal_order_id: orderResult.id,
        amount: parseFloat(amount),
        currency: currency,
        status: 'pending',
        customer_email: customerEmail,
        customer_name: customerName,
      });

    if (insertError) {
      console.error('Error storing order:', insertError);
      throw new Error('Failed to create order record');
    }

    console.log('Order stored successfully for user:', userId);

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