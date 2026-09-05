import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Scoped to the calling user — only used to verify who they are and that
    // they're actually an Admin, before we touch anything privileged.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } =
      await callerClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile, error: profileError } = await callerClient
      .from("Profile")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    if (profileError || profile?.role !== "ADMIN") {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only created after the admin check above passes — never exposed to the caller.
    const adminClient = createClient(supabaseUrl, serviceKey);
    const body = await req.json();

    if (body.action === "create") {
      const { email, password, fullName } = body;
      const { data: created, error: createError } =
        await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
      if (createError) throw createError;

      if (fullName) {
        await adminClient
          .from("Profile")
          .update({ fullName })
          .eq("id", created.user.id);
      }

      return new Response(JSON.stringify({ user: created.user }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "delete") {
      const { userId } = body;
      const { error: deleteError } =
        await adminClient.auth.admin.deleteUser(userId);
      if (deleteError) throw deleteError;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
