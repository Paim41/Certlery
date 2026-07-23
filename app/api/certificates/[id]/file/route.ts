import { createClient } from "../../../../../lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  if (!supabase) {
    return Response.json({ error: "Certificate storage is not configured." }, { status: 503 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

  const { id } = await context.params;
  const { data: certificate, error: findError } = await supabase
    .from("certificates")
    .select("file_key,file_name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (findError || !certificate?.file_key) {
    return Response.json({ error: "Certificate file not found." }, { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from("certificates")
    .download(certificate.file_key);
  if (error || !data) {
    return Response.json({ error: "Certificate file not found." }, { status: 404 });
  }

  return new Response(data, {
    headers: {
      "content-type": data.type || "application/octet-stream",
      "content-disposition": `inline; filename="${(certificate.file_name ?? "certificate").replace(/["\r\n]/g, "")}"`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
