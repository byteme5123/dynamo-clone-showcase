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

    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Capture PayPal order request:', requestBody);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid request body' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const { orderId } = requestBody;
    
    if (!orderId) {
      return new Response(JSON.stringify({ 
        error: 'Missing orderId parameter' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log('Capturing PayPal order:', orderId);

    // Get user from JWT token if provided
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
        if (!userError && user) {
          userId = user.id;
          console.log('User authenticated for capture:', userId);
        }
      } catch (error) {
        console.warn('Could not authenticate user for capture:', error);
      }
    }

    // Get PayPal settings
    const { data: paypalSettings, error: settingsError } = await supabaseService
      .from('paypal_settings')
      .select('*')
      .eq('is_active', true)
      .single();

    if (settingsError || !paypalSettings) {
      console.error('PayPal settings not found:', settingsError);
      return new Response(JSON.stringify({ 
        error: 'PayPal configuration not found' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
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

    // Get PayPal access token
    const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!authResponse.ok) {
      console.error('PayPal auth failed:', await authResponse.text());
      return new Response(JSON.stringify({ 
        error: 'PayPal authentication failed' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    console.log('PayPal access token obtained for capture');

    // Check if order was already processed
    const { data: existingOrder } = await supabaseService
      .from('orders')
      .select('status, paypal_capture_id')
      .eq('paypal_order_id', orderId)
      .single();

    if (existingOrder && existingOrder.status === 'completed') {
      console.log('Order already completed:', orderId);
      return new Response(JSON.stringify({
        success: true,
        orderId: existingOrder.paypal_capture_id || orderId,
        status: 'COMPLETED',
        message: 'Payment already processed successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Capture the PayPal order
    const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!captureResponse.ok) {
      const errorText = await captureResponse.text();
      console.error('PayPal capture failed:', errorText);
      
      // Handle specific PayPal errors
      let errorResponse;
      try {
        errorResponse = JSON.parse(errorText);
      } catch {
        errorResponse = { message: errorText };
      }
      
      // Handle max attempts exceeded - check if payment was actually processed
      if (errorResponse.details?.some((detail: any) => detail.issue === 'MAX_NUMBER_OF_PAYMENT_ATTEMPTS_EXCEEDED')) {
        console.log('Max attempts exceeded, checking if order was completed elsewhere');
        
        // Try to get order details from PayPal to check actual status
        const orderDetailsResponse = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (orderDetailsResponse.ok) {
          const orderDetails = await orderDetailsResponse.json();
          console.log('PayPal order details:', orderDetails);
          
          if (orderDetails.status === 'COMPLETED') {
            // Order was completed, update our database
            const updateData: any = {
              status: 'completed',
              paypal_capture_id: orderDetails.id,
              captured_at: new Date().toISOString(),
            };
            
            await supabaseService.from('orders').update(updateData).eq('paypal_order_id', orderId);
            
            return new Response(JSON.stringify({
              success: true,
              orderId: orderDetails.id,
              status: 'COMPLETED',
              message: 'Payment was already processed successfully'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            });
          }
        }
        
        // If we can't verify the status, return a specific error for max attempts
        return new Response(JSON.stringify({ 
          error: 'Payment verification failed due to multiple attempts. Please check your account or contact support.',
          success: false,
          errorCode: 'MAX_ATTEMPTS_EXCEEDED'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'Payment capture failed',
        success: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const captureResult = await captureResponse.json();
    console.log('PayPal order captured successfully:', captureResult.id);

    // Update order status in database
    const updateData: any = {
      status: captureResult.status === 'COMPLETED' ? 'completed' : 'failed',
      paypal_capture_id: captureResult.id,
      captured_at: new Date().toISOString(),
    };

    // If we have user context, update with user validation
    let updateQuery = supabaseService.from('orders').update(updateData);
    
    if (userId) {
      updateQuery = updateQuery.eq('user_id', userId);
    }
    
    const { error: updateError, data: updatedOrder } = await updateQuery
      .eq('paypal_order_id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating order status:', updateError);
      return new Response(JSON.stringify({ 
        error: 'Failed to update order status',
        success: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log('Order status updated successfully');

    // Create transaction record if payment was successful
    if (captureResult.status === 'COMPLETED' && updatedOrder) {
      const captureId = captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.id;
      
      const { data: newTransaction, error: transactionError } = await supabaseService
        .from('transactions')
        .insert({
          user_id: updatedOrder.user_id,
          plan_id: updatedOrder.plan_id,
          paypal_order_id: orderId,
          paypal_transaction_id: captureId,
          amount: updatedOrder.amount,
          currency: updatedOrder.currency || 'USD',
          status: 'completed',
          payment_method: 'PayPal',
        })
        .select()
        .single();

      if (transactionError) {
        console.error('Error creating transaction record:', transactionError);
      } else {
        console.log('Transaction record created successfully:', newTransaction?.id);
        
        // Update user's profile with active plan
        if (updatedOrder.user_id && updatedOrder.plan_id) {
          const { error: profileError } = await supabaseService
            .from('profiles')
            .update({
              current_plan_id: updatedOrder.plan_id,
              plan_status: 'active',
              plan_purchase_date: new Date().toISOString(),
            })
            .eq('id', updatedOrder.user_id);

          if (profileError) {
            console.error('Error updating user profile:', profileError);
          } else {
            console.log('User profile updated with active plan');
          }
        }
      }

      // Send payment receipt email (non-blocking)
      try {
        console.log('Sending payment receipt email to:', updatedOrder.customer_email);
        const emailResult = await supabaseService.functions.invoke('send-payment-receipt', {
          body: {
            email: updatedOrder.customer_email,
            customerName: updatedOrder.customer_name,
            orderId: updatedOrder.id,
            amount: updatedOrder.amount,
            planId: updatedOrder.plan_id,
            paymentId: captureId || captureResult.id,
          },
        });
        
        if (emailResult.error) {
          console.error('Email sending failed:', emailResult.error);
        } else {
          console.log('Payment receipt email sent successfully');
        }
      } catch (emailError) {
        console.error('Error invoking email function:', emailError);
        // Don't fail the whole operation if email fails
      }
    }

    const success = captureResult.status === 'COMPLETED';
    
    return new Response(JSON.stringify({
      success,
      orderId: captureResult.id,
      status: captureResult.status,
      message: success ? 'Payment completed successfully' : 'Payment processing failed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to capture PayPal order',
      success: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});