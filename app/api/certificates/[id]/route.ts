import { getAdminSession } from "../../../../lib/admin-auth";
import {
  deleteCertificate,
  isCertificateStorageConfigured,
} from "../../../../lib/certificate-store";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "Admin authentication required." }, { status: 401 });
  }
  if (!isCertificateStorageConfigured()) {
    return Response.json({ error: "Certificate storage is not configured." }, { status: 503 });
  }

  const { id } = await context.params;
  try {
    const deleted = await deleteCertificate(id);
    if (!deleted) {
      return Response.json({ error: "Certificate not found." }, { status: 404 });
    }
    return Response.json({ deleted: true });
  } catch (error) {
    console.error("Certificate deletion error", error);
    return Response.json(
      { error: "The certificate could not be deleted. Please try again." },
      { status: 500 },
    );
  }
}
