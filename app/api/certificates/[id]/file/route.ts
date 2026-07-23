import { getAdminSession } from "../../../../../lib/admin-auth";
import {
  certificateBelongsTo,
  isCertificateStorageConfigured,
  listCertificates,
} from "../../../../../lib/certificate-store";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isCertificateStorageConfigured()) {
    return Response.json({ error: "Certificate storage is not configured." }, { status: 503 });
  }

  const { id } = await context.params;
  try {
    const certificate = (await listCertificates()).find((item) => item.id === id);
    if (!certificate?.fileUrl) {
      return Response.json({ error: "Certificate file not found." }, { status: 404 });
    }

    const session = await getAdminSession();
    const isOwner = Boolean(
      session && certificateBelongsTo(certificate, session.username),
    );
    if (certificate.visibility === "private" && !isOwner) {
      return Response.json({ error: "Certificate file not found." }, { status: 404 });
    }

    const wantsDownload = new URL(request.url).searchParams.get("download") === "1";
    if (wantsDownload && certificate.allowDownload === false && !isOwner) {
      return Response.json({ error: "Downloads are disabled for this certificate." }, { status: 403 });
    }

    const source = await fetch(certificate.fileUrl, { cache: "no-store" });
    if (!source.ok || !source.body) {
      return Response.json({ error: "Certificate file not found." }, { status: 404 });
    }

    const fileName = certificate.fileName || `certificate.${certificate.fileType === "pdf" ? "pdf" : "png"}`;
    const asciiName = fileName.replace(/[^\x20-\x7E]/g, "_").replace(/["\\\r\n]/g, "_");
    const disposition = wantsDownload ? "attachment" : "inline";
    const encodedName = encodeURIComponent(fileName).replace(/'/g, "%27");
    const headers = new Headers({
      "content-type": certificate.mimeType || source.headers.get("content-type") || "application/octet-stream",
      "content-disposition": `${disposition}; filename="${asciiName}"; filename*=UTF-8''${encodedName}`,
      "cache-control": certificate.visibility === "private" ? "private, no-store" : "public, max-age=300",
      "x-content-type-options": "nosniff",
    });
    const contentLength = source.headers.get("content-length") || certificate.fileSize?.toString();
    if (contentLength) headers.set("content-length", contentLength);

    return new Response(source.body, {
      headers,
    });
  } catch (error) {
    console.error("Certificate file lookup error", error);
    return Response.json({ error: "Certificate file not found." }, { status: 404 });
  }
}
