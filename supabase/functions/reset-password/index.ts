import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
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

    const { token, newPassword }: ResetPasswordRequest = await req.json();

    if (!token || !newPassword) {
      return new Response(
        JSON.stringify({ error: 'Token and new password are required' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (newPassword.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters long' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('Processing password reset for token:', token.substring(0, 8) + '...');

    // Find user with valid reset token
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('id, email, first_name')
      .eq('reset_token', token)
      .gt('reset_token_expires', new Date().toISOString())
      .maybeSingle();

    if (userError) {
      console.error('User lookup error:', userError);
      return new Response(
        JSON.stringify({ error: 'Failed to process request' }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!user) {
      console.log('Invalid or expired reset token');
      return new Response(
        JSON.stringify({ error: 'Invalid or expired reset token' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('Valid reset token found for user:', user.email);

    // Hash the new password using bcrypt (matches sign-in process)
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and clear reset token
    const { error: updateError } = await supabaseClient
      .from('users')
      .update({
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Password update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update password' }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('Password updated successfully for user:', user.email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password updated successfully' 
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