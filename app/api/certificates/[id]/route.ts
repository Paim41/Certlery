import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../../chatgpt-auth";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

  const { id } = await context.params;
  const certificate = await env.DB.prepare(
    "SELECT file_key FROM certificates WHERE id = ? AND user_email = ?",
  )
    .bind(id, user.email)
    .first<{ file_key: string | null }>();

  if (!certificate) return Response.json({ error: "Certificate not found." }, { status: 404 });
  if (certificate.file_key) await env.CERTIFICATE_FILES.delete(certificate.file_key);
  await env.DB.prepare("DELETE FROM certificates WHERE id = ? AND user_email = ?")
    .bind(id, user.email)
    .run();
  return Response.json({ deleted: true });
}
