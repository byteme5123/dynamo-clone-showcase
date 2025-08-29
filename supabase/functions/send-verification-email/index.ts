import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName } = await req.json();

    console.log('Sending verification email to:', email);

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Generate verification token
    const { data: token, error: tokenError } = await supabaseClient
      .rpc('generate_verification_token', { user_email: email });

    if (tokenError) {
      console.error('Token generation error:', tokenError);
      throw new Error('Failed to generate verification token');
    }

    if (!token) {
      throw new Error('No verification token generated');
    }

    // Create verification URL
    const verificationUrl = `${req.headers.get("origin")}/auth?token=${token}`;

    // Send verification email
    const emailResult = await resend.emails.send({
      from: "Dynamo Wireless <noreply@dynamowireless.com>",
      to: [email],
      subject: "Verify your email address",
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 20px; }
        .welcome { font-size: 18px; color: #333; margin-bottom: 20px; }
        .message { color: #666; line-height: 1.6; margin-bottom: 30px; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .button:hover { opacity: 0.9; }
        .footer { padding: 20px; text-align: center; color: #999; font-size: 14px; border-top: 1px solid #eee; }
        .verification-code { background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 15px; margin: 20px 0; text-align: center; font-family: monospace; font-size: 16px; letter-spacing: 2px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Dynamo Wireless</h1>
        </div>
        <div class="content">
            <div class="welcome">
                Welcome${firstName ? `, ${firstName}` : ''}! 👋
            </div>
            <div class="message">
                Thank you for signing up with Dynamo Wireless! We're excited to have you join our community of connected users.
            </div>
            <div class="message">
                To complete your registration and secure your account, please verify your email address by clicking the button below:
            </div>
            <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <div class="message">
                If the button doesn't work, you can copy and paste this link into your browser:
            </div>
            <div class="verification-code">
                ${verificationUrl}
            </div>
            <div class="message">
                <strong>This verification link will expire in 24 hours.</strong>
            </div>
            <div class="message">
                If you didn't create an account with Dynamo Wireless, you can safely ignore this email.
            </div>
        </div>
        <div class="footer">
            <p>© 2024 Dynamo Wireless. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
      `,
      text: `
Welcome to Dynamo Wireless${firstName ? `, ${firstName}` : ''}!

Thank you for signing up! To complete your registration, please verify your email address by visiting:

${verificationUrl}

This verification link will expire in 24 hours.

If you didn't create an account with Dynamo Wireless, you can safely ignore this email.

© 2024 Dynamo Wireless. All rights reserved.
      `
    });

    console.log('Email sent successfully:', emailResult);

    return new Response(
      JSON.stringify({ success: true, message: 'Verification email sent successfully' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send verification email',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});