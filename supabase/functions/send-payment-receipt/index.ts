import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentReceiptRequest {
  email: string;
  customerName: string;
  orderId: string;
  amount: number;
  planId: string;
  paymentId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      email, 
      customerName, 
      orderId, 
      amount, 
      planId, 
      paymentId 
    }: PaymentReceiptRequest = await req.json();

    if (!email || !orderId || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get plan details
    const { data: plan, error: planError } = await supabaseClient
      .from('plans')
      .select('name, description, currency')
      .eq('id', planId)
      .maybeSingle();

    if (planError) {
      console.error('Plan lookup error:', planError);
    }

    const planName = plan?.name || 'Mobile Plan';
    const currency = plan?.currency || 'USD';
    const planDescription = plan?.description || '';

    // Format date
    const purchaseDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Log email attempt
    const { error: logError } = await supabaseClient
      .from('email_logs')
      .insert({
        user_id: null, // Will be updated if we have user context
        email_type: 'payment_receipt',
        recipient_email: email,
        subject: 'Purchase Confirmation - Your Dynamo Wireless Plan',
        status: 'sending',
        order_id: orderId
      });

    if (logError) {
      console.error('Error logging email:', logError);
    }

    // Send payment receipt email
    const emailResponse = await resend.emails.send({
      from: "Dynamo Wireless <dynamowirelessofficial@gmail.com>",
      to: [email],
      subject: "Purchase Confirmation - Your Dynamo Wireless Plan",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Purchase Confirmation - Dynamo Wireless</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            
            <!-- Header with Logo -->
            <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px;">
                DYNAMO WIRELESS
              </h1>
              <p style="color: #e3f2fd; margin: 5px 0 0 0; font-size: 14px;">Premium Mobile Data Plans</p>
            </div>

            <!-- Success Message -->
            <div style="padding: 30px 20px; text-align: center; background-color: #d4edda; border-left: 4px solid #28a745;">
              <h2 style="color: #155724; margin: 0 0 10px 0; font-size: 24px;">
                🎉 Purchase Confirmed!
              </h2>
              <p style="color: #155724; margin: 0; font-size: 16px;">
                Thank you for choosing Dynamo Wireless, ${customerName || 'Valued Customer'}!
              </p>
            </div>

            <!-- Invoice Section -->
            <div style="padding: 30px 20px;">
              <div style="background-color: #f8f9fa; border-radius: 10px; padding: 25px; margin-bottom: 25px; border: 1px solid #e9ecef;">
                <h3 style="color: #333; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                  📋 Invoice Details
                </h3>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <tr style="background-color: #ffffff;">
                    <td style="padding: 15px; font-weight: bold; color: #333; border-bottom: 1px solid #dee2e6; width: 40%;">
                      Plan Name:
                    </td>
                    <td style="padding: 15px; color: #666; border-bottom: 1px solid #dee2e6;">
                      ${planName}
                    </td>
                  </tr>
                  ${planDescription ? `
                  <tr style="background-color: #f8f9fa;">
                    <td style="padding: 15px; font-weight: bold; color: #333; border-bottom: 1px solid #dee2e6;">
                      Plan Details:
                    </td>
                    <td style="padding: 15px; color: #666; border-bottom: 1px solid #dee2e6;">
                      ${planDescription}
                    </td>
                  </tr>
                  ` : ''}
                  <tr style="background-color: #ffffff;">
                    <td style="padding: 15px; font-weight: bold; color: #333; border-bottom: 1px solid #dee2e6;">
                      Payment Method:
                    </td>
                    <td style="padding: 15px; color: #666; border-bottom: 1px solid #dee2e6;">
                      💳 PayPal
                    </td>
                  </tr>
                  <tr style="background-color: #f8f9fa;">
                    <td style="padding: 15px; font-weight: bold; color: #333; border-bottom: 1px solid #dee2e6;">
                      Purchase Date:
                    </td>
                    <td style="padding: 15px; color: #666; border-bottom: 1px solid #dee2e6;">
                      ${purchaseDate}
                    </td>
                  </tr>
                  <tr style="background-color: #e8f5e8;">
                    <td style="padding: 15px; font-weight: bold; color: #155724; border-bottom: 2px solid #28a745; font-size: 18px;">
                      Total Amount:
                    </td>
                    <td style="padding: 15px; color: #155724; border-bottom: 2px solid #28a745; font-size: 24px; font-weight: bold;">
                      ${currency.toUpperCase()} $${amount}
                    </td>
                  </tr>
                </table>

                <!-- Transaction IDs -->
                <div style="background-color: #ffffff; border-radius: 5px; padding: 15px; border-left: 3px solid #007bff;">
                  <h4 style="color: #007bff; margin: 0 0 10px 0; font-size: 16px;">Transaction References</h4>
                  <p style="margin: 5px 0; font-size: 14px; color: #666;">
                    <strong>Order ID:</strong> <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace;">${orderId}</code>
                  </p>
                  <p style="margin: 5px 0; font-size: 14px; color: #666;">
                    <strong>Payment ID:</strong> <code style="background-color: #f8f9fa; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace;">${paymentId}</code>
                  </p>
                </div>
              </div>

              <!-- Next Steps -->
              <div style="background-color: #e7f3ff; border-radius: 10px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #007bff;">
                <h3 style="color: #007bff; margin: 0 0 15px 0; font-size: 18px;">🚀 What's Next?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                  <li style="margin-bottom: 10px;">✅ Your mobile data plan is now active and ready to use</li>
                  <li style="margin-bottom: 10px;">📱 Access your account dashboard to manage your plan</li>
                  <li style="margin-bottom: 10px;">📧 Keep this email as your purchase receipt</li>
                  <li style="margin-bottom: 10px;">🆔 Use your account to activate SIM cards</li>
                  <li>📞 Contact our support team if you need assistance</li>
                </ul>
              </div>

              <!-- Action Buttons -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${req.headers.get('origin') || 'https://dynamo-wireless.lovable.app'}/account" 
                   style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: bold; font-size: 16px; margin: 0 10px 10px 0; box-shadow: 0 4px 15px rgba(0,123,255,0.3);">
                  🏠 View My Account
                </a>
                <a href="${req.headers.get('origin') || 'https://dynamo-wireless.lovable.app'}/activate-sim" 
                   style="background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: bold; font-size: 16px; margin: 0 10px 10px 0; box-shadow: 0 4px 15px rgba(40,167,69,0.3);">
                  📱 Activate SIM
                </a>
              </div>

              <!-- Support Information -->
              <div style="background-color: #fff3cd; border-radius: 10px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #ffc107;">
                <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">📞 Need Help?</h3>
                <p style="color: #856404; margin: 0; line-height: 1.6;">
                  Our customer support team is here to help you 24/7.<br>
                  📧 Email: <a href="mailto:support@dynamowireless.com" style="color: #007bff;">support@dynamowireless.com</a><br>
                  📱 Phone: <strong>+1 (555) 123-4567</strong><br>
                  💬 Live Chat: Visit our website for instant support
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #343a40; padding: 25px 20px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">
                Thank you for choosing Dynamo Wireless!
              </p>
              <p style="color: #adb5bd; margin: 0 0 15px 0; font-size: 14px;">
                This is an automated receipt. Please keep this email for your records.
              </p>
              <hr style="border: none; border-top: 1px solid #495057; margin: 20px 0;">
              <p style="color: #6c757d; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} Dynamo Wireless. All rights reserved.<br>
                You received this email because you made a purchase on our platform.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('Payment receipt email sent:', emailResponse);

    // Update email log with success/failure status
    if (emailResponse.data) {
      await supabaseClient
        .from('email_logs')
        .update({ status: 'sent' })
        .eq('recipient_email', email)
        .eq('order_id', orderId)
        .eq('status', 'sending');
    } else {
      await supabaseClient
        .from('email_logs')
        .update({ 
          status: 'failed',
          error_message: emailResponse.error?.message || 'Unknown error'
        })
        .eq('recipient_email', email)
        .eq('order_id', orderId)
        .eq('status', 'sending');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment receipt sent successfully',
        emailId: emailResponse.data?.id
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error('Payment receipt email error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send payment receipt' }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);