import { getAdminSession } from "../../../../../lib/admin-auth";
import { listCertificates } from "../../../../../lib/certificate-store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "Admin authentication required." }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const certificate = (await listCertificates()).find((item) => item.id === id);
    if (!certificate?.fileUrl) {
      return Response.json({ error: "Certificate file not found." }, { status: 404 });
    }
    return Response.redirect(certificate.downloadUrl ?? certificate.fileUrl);
  } catch (error) {
    console.error("Certificate file lookup error", error);
    return Response.json({ error: "Certificate file not found." }, { status: 404 });
  }
}
