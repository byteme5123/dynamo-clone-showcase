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
      from: "Dynamo Wireless <noreply@resend.dev>",
      to: [email],
      subject: "Payment Receipt - Your Plan Purchase",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #007bff; margin: 0;">Dynamo Wireless</h1>
            <p style="color: #666; margin: 5px 0;">Payment Receipt</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #28a745; margin: 0 0 10px 0; text-align: center;">
              ✅ Payment Successful!
            </h2>
            <p style="text-align: center; margin: 0; color: #666;">
              Thank you for your purchase, ${customerName || 'Valued Customer'}!
            </p>
          </div>

          <div style="background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #333; margin: 0 0 20px 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">
              Purchase Details
            </h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f3f4; font-weight: bold; color: #333;">
                  Plan:
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f3f4; color: #666;">
                  ${planName}
                </td>
              </tr>
              ${planDescription ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f3f4; font-weight: bold; color: #333;">
                  Description:
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f3f4; color: #666;">
                  ${planDescription}
                </td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f3f4; font-weight: bold; color: #333;">
                  Amount:
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f3f4; color: #666; font-size: 18px; font-weight: bold;">
                  ${currency.toUpperCase()} $${amount}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f3f4; font-weight: bold; color: #333;">
                  Purchase Date:
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f3f4; color: #666;">
                  ${purchaseDate}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f3f4; font-weight: bold; color: #333;">
                  Order ID:
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f1f3f4; color: #666; font-family: monospace;">
                  ${orderId}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #333;">
                  Payment ID:
                </td>
                <td style="padding: 10px 0; color: #666; font-family: monospace;">
                  ${paymentId}
                </td>
              </tr>
            </table>
          </div>

          <div style="background-color: #e3f2fd; border: 1px solid #2196f3; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #1976d2; margin: 0 0 15px 0;">Next Steps</h3>
            <ul style="margin: 0; padding-left: 20px; color: #333;">
              <li style="margin-bottom: 8px;">Your plan is now active and ready to use</li>
              <li style="margin-bottom: 8px;">You can view your plan details in your account dashboard</li>
              <li style="margin-bottom: 8px;">If you need to activate a SIM card, visit our activation page</li>
              <li>For support, contact our customer service team</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${req.headers.get('origin') || 'https://dynamo-wireless.lovable.app'}/account" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              View My Account
            </a>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <div style="text-align: center;">
            <p style="font-size: 12px; color: #666; margin: 10px 0;">
              This is an automated receipt for your purchase. Please keep this email for your records.
            </p>
            <p style="font-size: 12px; color: #666; margin: 0;">
              © Dynamo Wireless. All rights reserved.
            </p>
          </div>
        </div>
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