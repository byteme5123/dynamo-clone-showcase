import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  email: string;
  customerName?: string;
  orderId: string;
  planName: string;
  amount: number;
  currency: string;
  orderDate: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      customerName, 
      orderId, 
      planName, 
      amount, 
      currency,
      orderDate
    }: OrderConfirmationRequest = await req.json();

    const displayName = customerName || 'Valued Customer';
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);

    const emailResponse = await resend.emails.send({
      from: "Dynamo Wireless <orders@resend.dev>",
      to: [email],
      subject: `Order Confirmation - ${planName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #E30613, #FF4B4B); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed!</h1>
          </div>
          
          <div style="padding: 40px 20px; background: #ffffff;">
            <h2 style="color: #333; margin-top: 0;">Thank you, ${displayName}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Your order has been successfully processed. Here are the details:
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Order ID:</td>
                  <td style="padding: 10px 0; color: #333; text-align: right;">#${orderId.slice(0, 8)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Plan:</td>
                  <td style="padding: 10px 0; color: #333; text-align: right;">${planName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Amount:</td>
                  <td style="padding: 10px 0; color: #E30613; font-weight: bold; text-align: right; font-size: 18px;">${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Date:</td>
                  <td style="padding: 10px 0; color: #333; text-align: right;">${new Date(orderDate).toLocaleDateString()}</td>
                </tr>
              </table>
            </div>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Your plan will be activated within 24 hours. You'll receive another email with activation details and instructions.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '') || 'https://your-app-url.com'}/account" 
                 style="background: #E30613; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-right: 10px;">
                View Order
              </a>
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '') || 'https://your-app-url.com'}/contact" 
                 style="background: transparent; color: #E30613; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; border: 2px solid #E30613;">
                Contact Support
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If you have any questions about your order, please don't hesitate to contact our support team.
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Dynamo Wireless. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    console.log("Order confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);