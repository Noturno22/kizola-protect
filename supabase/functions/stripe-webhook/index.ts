import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import Stripe from "npm:stripe@^14.0.0";

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("Missing stripe-signature header");
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    console.error("Server environment variables are missing");
    return new Response("Server environment variables are missing", { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
  });

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  let event;
  const bodyText = await req.text();

  try {
    event = await stripe.webhooks.constructEventAsync(
      bodyText,
      signature,
      webhookSecret
    );
    console.log(`Webhook signature validated successfully. Event type: ${event.type}`);
  } catch (err: any) {
    console.error(`Signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    if (!metadata || !metadata.user_id || !metadata.plan_id) {
      console.error(`Missing user_id or plan_id in session metadata. Session ID: ${session.id}`);
      return new Response("Missing metadata in Stripe session", { status: 400 });
    }

    const userId = metadata.user_id;
    const planId = metadata.plan_id;

    console.log(`Processing successful payment for user: ${userId}, plan: ${planId}`);

    try {
      // 1. Idempotency Check: check if there's already an active subscription for this user
      // with a start date within the last 5 minutes (to avoid duplicate inserts)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: recentSub, error: recentSubErr } = await supabaseAdmin
        .from("subscriptions")
        .select("id")
        .eq("user_id", userId)
        .eq("plan_id", planId)
        .eq("status", "active")
        .gte("start_date", fiveMinutesAgo)
        .maybeSingle();

      if (recentSubErr) {
        console.error("Error checking recent subscription:", recentSubErr);
      }

      if (recentSub) {
        console.log(`Subscription for user ${userId} and plan ${planId} was already activated recently. Skipping insert.`);
        return new Response(JSON.stringify({ status: "success", message: "Subscription already activated" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const now = new Date();
      const nextBilling = new Date(now);
      nextBilling.setMonth(nextBilling.getMonth() + 1);

      // 2. Insert into subscriptions table
      const { data: subData, error: subError } = await supabaseAdmin
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan_id: planId,
          status: "active",
          start_date: now.toISOString(),
          next_billing_date: nextBilling.toISOString(),
        })
        .select()
        .single();

      if (subError) {
        console.error(`Failed to insert subscription for user ${userId}:`, subError);
        throw subError;
      }

      console.log(`Successfully created subscription record: ${subData.id}`);

      // 3. Update profiles table: status = 'active'
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ status: "active" })
        .eq("id", userId);

      if (profileError) {
        console.error(`Failed to update profile status for user ${userId}:`, profileError);
        throw profileError;
      }

      console.log(`Successfully updated profile status to active for user ${userId}`);

      // 4. Send a notification to the user
      const { error: notificationError } = await supabaseAdmin
        .from("notifications")
        .insert({
          user_id: userId,
          title: "Plano Ativado com Sucesso! ✅",
          message: `Sua assinatura do plano ${planId.toUpperCase()} foi confirmada via Stripe. Aproveite todos os seus benefícios agora mesmo.`,
          type: "success",
          read: false,
        });

      if (notificationError) {
        console.error(`Failed to create notification for user ${userId}:`, notificationError);
        // Do not fail the whole webhook if notifications fail
      } else {
        console.log(`Notification sent successfully to user ${userId}`);
      }

      return new Response(JSON.stringify({ status: "success", subscriptionId: subData.id }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    } catch (err: any) {
      console.error(`Database operations failed: ${err.message}`);
      return new Response(`Database Error: ${err.message}`, { status: 500 });
    }
  }

  // Handle other events gracefully
  console.log(`Ignoring unhandled event type: ${event.type}`);
  return new Response(JSON.stringify({ received: true, ignored: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
