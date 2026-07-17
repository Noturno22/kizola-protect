import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string | null;
  channelId?: string;
  badge?: number;
  priority?: "default" | "normal" | "high";
}

interface SendPushRequest {
  userId?: string;
  userIds?: string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// ── Helpers ───────────────────────────────────────────────────
async function getPushTokens(
  supabaseAdmin: ReturnType<typeof createClient>,
  userIds: string[]
): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("push_token")
    .in("id", userIds)
    .not("push_token", "is", null);

  if (error) {
    console.error("[send-push] Error fetching tokens:", error);
    return [];
  }

  return (data || [])
    .map((row) => row.push_token)
    .filter((token): token is string => Boolean(token));
}

async function sendToExpo(messages: PushMessage[]): Promise<{
  success: boolean;
  sentCount: number;
  failedTokens: string[];
}> {
  if (messages.length === 0) {
    return { success: true, sentCount: 0, failedTokens: [] };
  }

  // Batch into chunks of 100 (Expo limit)
  const chunks: PushMessage[][] = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }

  let totalSent = 0;
  const failedTokens: string[] = [];

  for (const chunk of chunks) {
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
        },
        body: JSON.stringify(chunk),
      });

      if (!response.ok) {
        console.error("[send-push] Expo API error:", response.status, await response.text());
        continue;
      }

      const result = await response.json();

      if (result.data) {
        for (let i = 0; i < result.data.length; i++) {
          const ticket = result.data[i];
          if (ticket.status === "error") {
            if (ticket.details?.error === "DeviceNotRegistered") {
              failedTokens.push(chunk[i].to);
            }
            console.error(`[send-push] Ticket error:`, ticket);
          } else {
            totalSent++;
          }
        }
      }
    } catch (error) {
      console.error("[send-push] Fetch error:", error);
    }
  }

  return { success: totalSent > 0, sentCount: totalSent, failedTokens };
}

async function cleanupInvalidTokens(
  supabaseAdmin: ReturnType<typeof createClient>,
  failedTokens: string[]
): Promise<void> {
  if (failedTokens.length === 0) return;

  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        push_token: null,
        push_token_updated_at: new Date().toISOString(),
      })
      .in("push_token", failedTokens);

    if (error) {
      console.error("[send-push] Error cleaning up invalid tokens:", error);
    } else {
      console.log(`[send-push] Cleaned up ${failedTokens.length} invalid tokens`);
    }
  } catch (error) {
    console.error("[send-push] Unexpected error cleaning tokens:", error);
  }
}

// ── Main Handler ──────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const body: SendPushRequest = await req.json();
    const { userId, userIds, title, body: messageBody, data } = body;

    if (!title || !messageBody) {
      return new Response(
        JSON.stringify({ success: false, error: "Title and body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine target users
    const targetUserIds = userId ? [userId] : userIds;
    if (!targetUserIds || targetUserIds.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "userId or userIds is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get push tokens
    const tokens = await getPushTokens(supabaseAdmin, targetUserIds);

    if (tokens.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sentCount: 0, message: "No push tokens found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build messages
    const messages: PushMessage[] = tokens.map((token) => ({
      to: token,
      title,
      body: messageBody,
      data: data ?? {},
      sound: "default",
      channelId: "default",
      priority: "high",
    }));

    // Send to Expo
    const result = await sendToExpo(messages);

    // Cleanup invalid tokens
    if (result.failedTokens.length > 0) {
      await cleanupInvalidTokens(supabaseAdmin, result.failedTokens);
    }

    return new Response(
      JSON.stringify({
        success: result.success,
        sentCount: result.sentCount,
        failedCount: result.failedTokens.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[send-push] Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
