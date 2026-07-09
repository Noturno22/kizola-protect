import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import Stripe from "npm:stripe@^14.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const PLANS = {
  basic: { name: "Basic", price: 19.99 },
  pro: { name: "Pro", price: 34.99 },
  premium: { name: "Premium", price: 49.99 },
};

Deno.serve(async (req) => {
  const { method } = req;

  // Handle CORS preflight request
  if (method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Handle status pages (GET request)
  if (method === "GET") {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    if (status === "success") {
      return new Response(
        `<!DOCTYPE html>
        <html lang="pt">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pagamento Concluído - Kizola Protect</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Inter', sans-serif;
              background: #0B0F19;
              color: #FFFFFF;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              box-sizing: border-box;
            }
            .card {
              background: rgba(255, 255, 255, 0.03);
              backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 24px;
              padding: 40px 30px;
              text-align: center;
              max-width: 400px;
              width: 100%;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
              animation: fadeInUp 0.8s ease-out;
            }
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .icon-wrapper {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #10B981, #059669);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 24px;
              box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
              animation: pulse 2s infinite;
            }
            @keyframes pulse {
              0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
              70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
              100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
            }
            .icon {
              font-size: 40px;
              color: white;
            }
            h1 {
              font-size: 26px;
              font-weight: 800;
              margin: 0 0 12px;
              background: linear-gradient(135deg, #FFFFFF, #94A3B8);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            p {
              font-size: 15px;
              color: #94A3B8;
              line-height: 1.6;
              margin: 0 0 32px;
            }
            .btn {
              display: inline-block;
              width: 100%;
              background: linear-gradient(135deg, #3B82F6, #2563EB);
              color: #FFFFFF;
              text-decoration: none;
              font-weight: 700;
              font-size: 16px;
              padding: 16px;
              border-radius: 14px;
              box-sizing: border-box;
              transition: all 0.3s ease;
              box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
            }
            .btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon-wrapper">
              <span class="icon">✓</span>
            </div>
            <h1>Pagamento Concluído!</h1>
            <p>Sua assinatura foi processada com sucesso. Clique no botão abaixo para voltar ao aplicativo e começar a usar seus novos benefícios.</p>
            <a href="kizola://dashboard" class="btn">Voltar para o Aplicativo</a>
          </div>
          <script>
            // Auto redirect to deep link after 3 seconds
            setTimeout(function() {
              window.location.href = "kizola://dashboard";
            }, 3000);
          </script>
        </body>
        </html>`,
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    if (status === "cancel") {
      return new Response(
        `<!DOCTYPE html>
        <html lang="pt">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pagamento Cancelado - Kizola Protect</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Inter', sans-serif;
              background: #0B0F19;
              color: #FFFFFF;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              box-sizing: border-box;
            }
            .card {
              background: rgba(255, 255, 255, 0.03);
              backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 24px;
              padding: 40px 30px;
              text-align: center;
              max-width: 400px;
              width: 100%;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
              animation: fadeInUp 0.8s ease-out;
            }
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .icon-wrapper {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #EF4444, #DC2626);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 24px;
              box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
            }
            .icon {
              font-size: 40px;
              color: white;
            }
            h1 {
              font-size: 26px;
              font-weight: 800;
              margin: 0 0 12px;
              background: linear-gradient(135deg, #FFFFFF, #94A3B8);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            p {
              font-size: 15px;
              color: #94A3B8;
              line-height: 1.6;
              margin: 0 0 32px;
            }
            .btn {
              display: inline-block;
              width: 100%;
              background: rgba(255, 255, 255, 0.08);
              color: #FFFFFF;
              text-decoration: none;
              font-weight: 700;
              font-size: 16px;
              padding: 16px;
              border-radius: 14px;
              box-sizing: border-box;
              transition: all 0.3s ease;
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .btn:hover {
              background: rgba(255, 255, 255, 0.12);
              transform: translateY(-2px);
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon-wrapper">
              <span class="icon">✕</span>
            </div>
            <h1>Pagamento Cancelado</h1>
            <p>O processo de pagamento foi interrompido. Nenhuma cobrança foi efetuada. Você pode tentar novamente a qualquer momento.</p>
            <a href="kizola://plans" class="btn">Voltar para o Aplicativo</a>
          </div>
          <script>
            // Auto redirect to deep link after 3 seconds
            setTimeout(function() {
              window.location.href = "kizola://plans";
            }, 3000);
          </script>
        </body>
        </html>`,
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }
  }

  // Handle Checkout creation (POST request)
  try {
    // 1. Get Authorization token from request header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Initialize Supabase Client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // 3. Get User Profile and ensure they are authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: " + (userError?.message ?? "Invalid user token") }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Parse request body for planId
    const body = await req.json().catch(() => ({}));
    const { planId } = body;

    if (!planId || !PLANS[planId as keyof typeof PLANS]) {
      return new Response(
        JSON.stringify({ error: "Invalid planId selected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const plan = PLANS[planId as keyof typeof PLANS];

    // 5. Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: "Stripe configuration is missing on server" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Determine our own edge function URL to use for success/cancel redirects
    const functionUrl = req.url.split("?")[0];
    const successUrl = `${functionUrl}?status=success`;
    const cancelUrl = `${functionUrl}?status=cancel`;

    // 6. Create Stripe Checkout Session
    console.log(`Creating Stripe Checkout Session for user ${user.id} and plan ${planId}`);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Plano ${plan.name}`,
              description: `Assinatura mensal Kizola Protect - Plano ${plan.name}`,
            },
            unit_amount: Math.round(plan.price * 100),
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
    });

    return new Response(
      JSON.stringify({ id: session.id, url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error(`Error in create-checkout-session: ${err.message}`);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
