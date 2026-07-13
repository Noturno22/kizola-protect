import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone: rawPhone, code: rawCode } = await req.json();

    // Validate inputs
    if (!rawPhone || typeof rawPhone !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Phone number is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const phone = rawPhone.replace(/[\s\-().]/g, "").trim();
    if (!PHONE_REGEX.test(phone)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid phone number." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!rawCode || typeof rawCode !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Verification code is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const code = rawCode.replace(/\s/g, "");
    if (!/^\d{6}$/.test(code)) {
      return new Response(
        JSON.stringify({ success: false, error: "Verification code must be exactly 6 digits." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Verify code with Twilio
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const verifySid = Deno.env.get("TWILIO_VERIFY_SERVICE_SID");

    if (!accountSid || !authToken || !verifySid) {
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const credentials = btoa(`${accountSid}:${authToken}`);
    const twilioRes = await fetch(
      `https://verify.twilio.com/v2/Services/${verifySid}/VerificationChecks`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: phone, Code: code }),
      }
    );

    const twilioData = await twilioRes.json();

    if (!twilioRes.ok || twilioData.status !== "approved") {
      const errorMsg = twilioData.status === "pending"
        ? "Invalid code. Please check and try again."
        : "Verification code has expired. Please request a new one.";
      return new Response(
        JSON.stringify({ success: false, error: errorMsg, status: twilioData.status }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. OTP approved — get or create Supabase user with admin API
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const digitsOnly = phone.replace(/\W/g, "");
    const placeholderEmail = `${digitsOnly}@phone.kizola.app`;
    const userPassword = `kp_${digitsOnly}_${supabaseUrl.slice(8, 16) || "default"}`;

    // Try to find existing user
    let user = null;
    let isNew = false;

    try {
      const { data: userData, error: getUserError } = await adminClient.auth.admin.getUserByEmail(placeholderEmail);
      if (!getUserError && userData?.user) {
        user = userData.user;
      }
    } catch {
      // Fallback
    }

    // Create user if not found
    if (!user) {
      const policyNumber = `KP-${Math.floor(100000 + Math.random() * 900000)}`;

      const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        phone,
        email: placeholderEmail,
        password: userPassword,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: { phone, policy_number: policyNumber, role: "user", full_name: "Phone User" },
      });

      if (createError) {
        if (createError.status === 422 || createError.message?.includes("already")) {
          const { data: existingUsers } = await adminClient.auth.admin.listUsers({ perPage: 100 });
          user = existingUsers?.users?.find((u) => u.email === placeholderEmail);
          if (!user) {
            return new Response(
              JSON.stringify({ success: false, error: "Failed to create user." }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } else {
          console.error("Failed to create user:", createError);
          return new Response(
            JSON.stringify({ success: false, error: "Failed to create user." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        user = created.user;
        isNew = true;

        // Create profile row (ignore duplicates)
        await adminClient.from("profiles").insert({
          id: user.id,
          email: placeholderEmail,
          full_name: "Phone User",
          phone,
          role: "user",
          policy_number: policyNumber,
        }).then(() => {}).catch((e: any) => {
          if (e.code !== "23505") console.warn("Profile insert warning:", e);
        });

        // Welcome notification
        await adminClient.from("notifications").insert({
          user_id: user.id,
          title: "Bem-vindo à Kizola Protect!",
          message: "Sua conta foi criada com sucesso. Explore nossos benefícios.",
          type: "success",
          read: false,
        }).catch(() => {});
      }
    }

    // 3. Sign in with email/password to get session tokens
    const { data: sessionData, error: signInError } = await adminClient.auth.signInWithPassword({
      email: placeholderEmail,
      password: userPassword,
    });

    if (signInError || !sessionData?.session) {
      console.error("Failed to sign in:", signInError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create session." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        userId: user.id,
        accessToken: sessionData.session.access_token,
        refreshToken: sessionData.session.refresh_token,
        isNew,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("verify-code error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
