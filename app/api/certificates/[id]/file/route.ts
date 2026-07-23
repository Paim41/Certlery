import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../../../chatgpt-auth";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const user = await getChatGPTUser();
  const certificate = await env.DB.prepare(
    `SELECT user_email, file_key, file_name, visibility, allow_download
     FROM certificates WHERE id = ?`,
  )
    .bind(id)
    .first<{
      user_email: string;
      file_key: string | null;
      file_name: string | null;
      visibility: string;
      allow_download: number;
    }>();

  if (!certificate || !certificate.file_key) {
    return Response.json({ error: "Certificate file not found." }, { status: 404 });
  }
  const isOwner = user?.email === certificate.user_email;
  const isPubliclyVisible = certificate.visibility === "public" && certificate.allow_download === 1;
  if (!isOwner && !isPubliclyVisible) {
    return Response.json({ error: "You do not have access to this file." }, { status: 403 });
  }

  const object = await env.CERTIFICATE_FILES.get(certificate.file_key);
  if (!object) return Response.json({ error: "Certificate file not found." }, { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", isOwner ? "private, no-store" : "public, max-age=300");
  headers.set("x-content-type-options", "nosniff");
  headers.set(
    "content-disposition",
    `inline; filename="${(certificate.file_name ?? "certificate").replace(/["\r\n]/g, "")}"`,
  );
  return new Response(object.body, { headers });
}
