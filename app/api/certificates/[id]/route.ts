import { createClient } from "../../../../lib/supabase/server";

export async function DELETE(
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
    .select("file_key")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (findError || !certificate) {
    return Response.json({ error: "Certificate not found." }, { status: 404 });
  }

  if (certificate.file_key) {
    await supabase.storage.from("certificates").remove([certificate.file_key]);
  }
  const { error } = await supabase
    .from("certificates")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ deleted: true });
}
