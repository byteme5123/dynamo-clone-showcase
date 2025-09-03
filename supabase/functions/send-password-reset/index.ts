import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
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

    const { email }: PasswordResetRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user exists
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('id, first_name, email')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      console.error('User lookup error:', userError);
      return new Response(
        JSON.stringify({ error: 'Failed to process request' }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!user) {
      // Don't reveal if email exists or not for security
      return new Response(
        JSON.stringify({ success: true, message: 'If the email exists, a reset link has been sent' }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomUUID();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiry

    // Store reset token
    const { error: updateError } = await supabaseClient
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expires: resetExpires.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Token update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to process request' }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send reset email
    const resetUrl = `${req.headers.get('origin') || 'https://dynamo-wireless.lovable.app'}/auth?reset_token=${resetToken}`;
    
    console.log('Sending password reset email to:', email, 'with reset URL:', resetUrl);
    
    const emailResponse = await resend.emails.send({
      from: "Dynamo Wireless <noreply@dynamowireless.com>",
      to: [email],
      subject: "Password Reset Request - Dynamo Wireless",
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
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
        .reset-code { background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 15px; margin: 20px 0; text-align: center; font-family: monospace; font-size: 14px; word-break: break-all; }
        .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0; color: #856404; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Dynamo Wireless</h1>
        </div>
        <div class="content">
            <div class="welcome">
                Hello ${user.first_name || 'there'}! 👋
            </div>
            <div class="message">
                We received a request to reset your password for your Dynamo Wireless account.
            </div>
            <div class="message">
                Click the button below to create a new password:
            </div>
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Your Password</a>
            </div>
            <div class="message">
                If the button doesn't work, you can copy and paste this link into your browser:
            </div>
            <div class="reset-code">
                ${resetUrl}
            </div>
            <div class="warning">
                <strong>⚠️ Important:</strong> This password reset link will expire in 1 hour for security reasons.
            </div>
            <div class="message">
                If you didn't request this password reset, you can safely ignore this email - your account remains secure.
            </div>
        </div>
        <div class="footer">
            <p>© 2024 Dynamo Wireless. All rights reserved.</p>
            <p>This is an automated security message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
      `,
      text: `
Password Reset Request - Dynamo Wireless

Hello ${user.first_name || 'there'}!

We received a request to reset your password for your Dynamo Wireless account.

To reset your password, please visit this link:
${resetUrl}

This password reset link will expire in 1 hour for security reasons.

If you didn't request this password reset, you can safely ignore this email - your account remains secure.

© 2024 Dynamo Wireless. All rights reserved.
      `
    });

    if (emailResponse.error) {
      console.error('Email sending error:', emailResponse.error);
      throw new Error('Failed to send password reset email');
    }

    console.log('Password reset email sent successfully:', {
      id: emailResponse.data?.id,
      to: email,
      resetToken: resetToken.substring(0, 8) + '...' // Log partial token for debugging
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'If the email exists, a reset link has been sent',
        emailId: emailResponse.data?.id
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error('Password reset error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);