const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "content-type": "application/json; charset=utf-8",
    },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const adminUser = Deno.env.get("ADMIN_LEADS_USER");
  const adminPassword = Deno.env.get("ADMIN_LEADS_PASSWORD");
  const tableName = Deno.env.get("LEADS_TABLE") || "leads";

  if (!supabaseUrl || !serviceRoleKey || !adminUser || !adminPassword) {
    return jsonResponse({ error: "Admin leads function is not configured" }, 500);
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  if (body.username !== adminUser || body.password !== adminPassword) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/${tableName}?select=*&order=created_at.desc`,
    {
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );

  if (!response.ok) {
    return jsonResponse({ error: "Could not load leads" }, 500);
  }

  return jsonResponse({ leads: await response.json() });
});
