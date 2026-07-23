import { z } from "zod";
import { getAdminSession } from "../../../../lib/admin-auth";
import {
  deleteCertificate,
  isCertificateStorageConfigured,
  updateCertificate,
} from "../../../../lib/certificate-store";

export const runtime = "nodejs";

const updateInput = z.object({
  visibility: z.enum(["public", "private", "unlisted"]).optional(),
  featured: z.boolean().optional(),
  allowDownload: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "Admin authentication required." }, { status: 401 });
  }
  if (!isCertificateStorageConfigured()) {
    return Response.json({ error: "Certificate storage is not configured." }, { status: 503 });
  }

  const parsed = updateInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Choose a valid gallery setting." }, { status: 400 });
  }

  const { id } = await context.params;
  try {
    const certificate = await updateCertificate(id, parsed.data);
    if (!certificate) {
      return Response.json({ error: "Certificate not found." }, { status: 404 });
    }
    return Response.json({ certificate });
  } catch (error) {
    console.error("Certificate update error", error);
    return Response.json(
      { error: "The gallery setting could not be saved. Please try again." },
      { status: 500 },
    );
  }
}

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
