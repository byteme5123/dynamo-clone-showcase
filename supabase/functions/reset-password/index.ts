import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('=== PASSWORD RESET FUNCTION STARTED ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));

  if (req.method === "OPTIONS") {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Creating Supabase client...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check - SUPABASE_URL exists:', !!supabaseUrl);
    console.log('Environment check - SERVICE_ROLE_KEY exists:', !!serviceRoleKey);
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error',
          details: 'Missing environment variables'
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, serviceRoleKey);
    console.log('Supabase client created successfully');

    console.log('Parsing request body...');
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log('Raw request body:', bodyText);
      requestBody = JSON.parse(bodyText);
      console.log('Parsed request body:', requestBody);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request format',
          details: parseError.message
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { token, newPassword }: ResetPasswordRequest = requestBody;
    console.log('Extracted token:', token ? token.substring(0, 8) + '...' : 'undefined');
    console.log('Extracted password length:', newPassword ? newPassword.length : 'undefined');

    if (!token || !newPassword) {
      console.log('Validation failed: Missing token or password');
      return new Response(
        JSON.stringify({ 
          error: 'Token and new password are required',
          details: `Token: ${!!token}, Password: ${!!newPassword}`
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (newPassword.length < 8) {
      console.log('Validation failed: Password too short');
      return new Response(
        JSON.stringify({ 
          error: 'Password must be at least 8 characters long',
          details: `Current length: ${newPassword.length}`
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('Processing password reset for token:', token.substring(0, 8) + '...');

    // Test database connection first
    console.log('Testing database connection...');
    try {
      const { data: testData, error: testError } = await supabaseClient
        .from('users')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('Database connection test failed:', testError);
        return new Response(
          JSON.stringify({ 
            error: 'Database connection failed',
            details: testError.message
          }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      console.log('Database connection test successful');
    } catch (dbTestError) {
      console.error('Database connection test exception:', dbTestError);
      return new Response(
        JSON.stringify({ 
          error: 'Database connection exception',
          details: dbTestError.message
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Find user with valid reset token
    console.log('Looking up user with reset token...');
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('id, email, first_name, reset_token, reset_token_expires')
      .eq('reset_token', token)
      .maybeSingle();

    console.log('User lookup result:', { user: user ? { id: user.id, email: user.email } : null, error: userError });

    if (userError) {
      console.error('User lookup error:', userError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process request',
          details: userError.message
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!user) {
      console.log('No user found with token, checking for any users with this token...');
      const { data: anyUsers, error: anyError } = await supabaseClient
        .from('users')
        .select('id, email, reset_token, reset_token_expires')
        .eq('reset_token', token);
      
      console.log('Any users with token:', anyUsers);
      console.log('Current time:', new Date().toISOString());
      
      return new Response(
        JSON.stringify({ 
          error: 'Invalid or expired reset token',
          details: 'No user found with this token or token has expired'
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check token expiry manually
    const now = new Date();
    const expires = new Date(user.reset_token_expires);
    console.log('Token expiry check - Now:', now.toISOString(), 'Expires:', expires.toISOString(), 'Valid:', expires > now);

    if (expires <= now) {
      console.log('Token has expired');
      return new Response(
        JSON.stringify({ 
          error: 'Reset token has expired',
          details: `Token expired at ${expires.toISOString()}, current time is ${now.toISOString()}`
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('Valid reset token found for user:', user.email);

    // Hash the new password using bcrypt (matches sign-in process)
    console.log('Hashing new password...');
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(newPassword, 12);
      console.log('Password hashed successfully');
    } catch (hashError) {
      console.error('Password hashing failed:', hashError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process password',
          details: hashError.message
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update user password and clear reset token
    console.log('Updating user password in database...');
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
        JSON.stringify({ 
          error: 'Failed to update password',
          details: updateError.message
        }),
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
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);