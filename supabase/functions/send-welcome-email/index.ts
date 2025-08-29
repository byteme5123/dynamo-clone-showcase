import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  firstName?: string;
  lastName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName }: WelcomeEmailRequest = await req.json();

    const displayName = firstName 
      ? `${firstName}${lastName ? ` ${lastName}` : ''}`
      : 'there';

    const emailResponse = await resend.emails.send({
      from: "Dynamo Wireless <welcome@resend.dev>",
      to: [email],
      subject: "Welcome to Dynamo Wireless!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #E30613, #FF4B4B); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Dynamo Wireless!</h1>
          </div>
          
          <div style="padding: 40px 20px; background: #ffffff;">
            <h2 style="color: #333; margin-top: 0;">Hello ${displayName}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Thank you for joining Dynamo Wireless! We're excited to have you as part of our community.
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              With your new account, you can:
            </p>
            
            <ul style="color: #666; font-size: 16px; line-height: 1.6;">
              <li>Track your orders and purchase history</li>
              <li>Manage your wireless plans</li>
              <li>Get exclusive offers and updates</li>
              <li>Access customer support</li>
            </ul>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '') || 'https://your-app-url.com'}/account" 
                 style="background: #E30613; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Go to My Account
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If you have any questions, feel free to contact our support team. We're here to help!
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Dynamo Wireless. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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