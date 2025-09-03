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

    // Send payment receipt email
    const emailResponse = await resend.emails.send({
      from: "Dynamo Wireless <noreply@dynamowireless.com>",
      to: [email],
      subject: "Purchase Confirmation - Your Dynamo Wireless Plan",
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purchase Confirmation - Dynamo Wireless</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header with Logo -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white;">
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px;">
                🔥 Dynamo Wireless
            </div>
            <div style="font-size: 18px; font-weight: 300; opacity: 0.9;">
                Purchase Confirmation & Receipt
            </div>
        </div>

        <!-- Success Message -->
        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px 30px; text-align: center;">
            <h2 style="margin: 0 0 10px 0; font-size: 24px;">
                ✅ Payment Successfully Processed!
            </h2>
            <p style="margin: 0; font-size: 16px;">
                Thank you for choosing Dynamo Wireless, ${customerName || 'Valued Customer'}!
            </p>
        </div>

        <!-- Purchase Details -->
        <div style="padding: 30px;">
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
                <h3 style="color: #667eea; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                    📋 Purchase Details
                </h3>
                
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; font-weight: 600; width: 35%;">
                            Plan Name:
                        </td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #495057;">
                            ${planName}
                        </td>
                    </tr>
                    ${planDescription ? `
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; font-weight: 600;">
                            Plan Details:
                        </td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #495057;">
                            ${planDescription.replace(/\n/g, '<br>')}
                        </td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; font-weight: 600;">
                            Duration:
                        </td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #495057;">
                            30 Days
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; font-weight: 600;">
                            Purchase Date:
                        </td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #495057;">
                            ${purchaseDate}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; font-weight: 600;">
                            Payment Method:
                        </td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #495057;">
                            PayPal
                        </td>
                    </tr>
                    <tr style="background-color: #e7f3ff;">
                        <td style="padding: 15px 0; font-weight: bold; font-size: 16px; color: #0066cc;">
                            Total Amount Paid:
                        </td>
                        <td style="padding: 15px 0; font-weight: bold; font-size: 20px; color: #0066cc;">
                            $${parseFloat(amount).toFixed(2)} ${currency.toUpperCase()}
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Transaction Details -->
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">
                    🧾 Transaction Information
                </h3>
                <div style="font-size: 13px; color: #856404;">
                    <p style="margin: 8px 0;"><strong>Order ID:</strong> <span style="font-family: monospace; background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 3px;">${orderId}</span></p>
                    <p style="margin: 8px 0;"><strong>Payment ID:</strong> <span style="font-family: monospace; background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 3px;">${paymentId}</span></p>
                    <p style="margin: 8px 0; font-size: 12px; font-style: italic;">Please keep this information for your records and future reference.</p>
                </div>
            </div>

            <!-- Next Steps -->
            <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="color: #0c5460; margin: 0 0 15px 0; font-size: 18px;">
                    🚀 What's Next?
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #0c5460; font-size: 14px;">
                    <li style="margin-bottom: 8px;">Your mobile plan is now <strong>active and ready to use</strong></li>
                    <li style="margin-bottom: 8px;">View your plan details and usage in your <strong>account dashboard</strong></li>
                    <li style="margin-bottom: 8px;">Need to activate a SIM card? Visit our <strong>SIM activation page</strong></li>
                    <li style="margin-bottom: 8px;">Your plan will renew automatically in <strong>30 days</strong></li>
                    <li>Questions? Our bilingual support team is here to help!</li>
                </ul>
            </div>

            <!-- CTA Buttons -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="${req.headers.get('origin') || 'https://dynamo-wireless.lovable.app'}/account" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin: 5px 10px; font-size: 16px;">
                    📱 View My Account
                </a>
                <a href="${req.headers.get('origin') || 'https://dynamo-wireless.lovable.app'}/activate-sim" 
                   style="background-color: #28a745; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin: 5px 10px; font-size: 16px;">
                    🔧 Activate SIM
                </a>
            </div>

            <!-- Support Information -->
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center;">
                <h4 style="color: #495057; margin: 0 0 15px 0;">Need Help?</h4>
                <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">
                    Our bilingual customer support team is available to assist you.
                </p>
                <p style="margin: 0; color: #6c757d; font-size: 14px;">
                    <strong>Email:</strong> support@dynamowireless.com | 
                    <strong>Phone:</strong> 1-800-DYNAMO-1
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #2c3e50; color: white; padding: 25px; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 12px; opacity: 0.8;">
                This is an automated purchase confirmation. Please keep this email for your records.
            </p>
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">
                © 2024 Dynamo Wireless. All rights reserved. | 
                <a href="${req.headers.get('origin') || 'https://dynamo-wireless.lovable.app'}/contact" style="color: #74b9ff; text-decoration: none;">Contact Us</a>
            </p>
        </div>
    </div>
</body>
</html>
      `,
    });

    console.log('Payment receipt email sent:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment receipt sent successfully' 
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