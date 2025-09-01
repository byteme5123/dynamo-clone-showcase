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

    const { orderId, sessionToken } = await req.json();
    console.log('Capturing PayPal order:', orderId);

    // Get user info from session token if provided
    let authenticatedUserId = null;
    
    if (sessionToken) {
      console.log('Session token provided for capture, length:', sessionToken.length);
      
      // Use service role key for session lookup to bypass RLS
      const supabaseService = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
      );
      
      // Validate session token
      const { data: session, error: sessionError } = await supabaseService
        .from('user_sessions')
        .select('user_id')
        .eq('token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (session) {
        authenticatedUserId = session.user_id;
        console.log('Authenticated user for capture:', authenticatedUserId);
      } else {
        console.warn('Invalid or expired session token for capture:', sessionError);
      }
    } else {
      console.warn('No session token provided for capture');
    }

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

    // Check if order was already captured to prevent duplicates
    const { data: existingOrder, error: orderError } = await supabaseService
      .from('orders')
      .select('user_id, plan_id, amount, customer_email, customer_name, status, paypal_payment_id')
      .eq('paypal_order_id', orderId)
      .single();

    if (orderError) {
      console.error('Error finding order:', orderError);
      throw new Error('Order not found');
    }

    // If order is already paid, return success without re-processing
    if (existingOrder.status === 'paid' && existingOrder.paypal_payment_id) {
      console.log('Order already captured:', orderId);
      return new Response(JSON.stringify({
        success: true,
        paymentId: existingOrder.paypal_payment_id,
        status: 'paid',
        message: 'Order already processed'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const order = existingOrder;


    console.log('Found order:', { 
      orderId, 
      user_id: order?.user_id, 
      plan_id: order?.plan_id, 
      amount: order?.amount 
    });

    // Validate user association
    if (authenticatedUserId && order?.user_id && authenticatedUserId !== order.user_id) {
      console.error('User mismatch:', { authenticatedUserId, orderUserId: order.user_id });
      throw new Error('Unauthorized: Order belongs to different user');
    }

    // If we have an authenticated user but order has null user_id, update it
    if (authenticatedUserId && !order?.user_id) {
      console.log('Updating order with authenticated user_id:', authenticatedUserId);
      await supabaseService
        .from('orders')
        .update({ user_id: authenticatedUserId })
        .eq('paypal_order_id', orderId);
      
      // Update local order object
      order.user_id = authenticatedUserId;
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
      const finalUserId = order.user_id || authenticatedUserId;
      
      if (!finalUserId) {
        console.error('Cannot create transaction: no user_id available');
      } else {
        console.log('Creating transaction for user:', finalUserId);
        
        // Check if transaction already exists to prevent duplicates
        const { data: existingTransaction } = await supabaseService
          .from('transactions')
          .select('id')
          .eq('paypal_order_id', orderId)
          .maybeSingle();

        if (!existingTransaction) {
          const { error: transactionError } = await supabaseService
            .from('transactions')
            .insert({
              user_id: finalUserId,
              plan_id: order.plan_id,
              amount: order.amount,
              paypal_transaction_id: paymentId,
              paypal_order_id: orderId,
              status: 'completed',
              payment_method: 'PayPal',
            });

          if (transactionError) {
            console.error('Error creating transaction:', transactionError);
          } else {
            console.log('Transaction created successfully for user:', finalUserId);
          }
        } else {
          console.log('Transaction already exists for order:', orderId);
        }
      }
    }

    return new Response(JSON.stringify({
      success: status === 'paid',
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