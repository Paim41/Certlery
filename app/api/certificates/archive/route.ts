import { zipSync } from "fflate";
import { getAdminSession } from "../../../../lib/admin-auth";
import {
  isCertificateStorageConfigured,
  listCertificates,
} from "../../../../lib/certificate-store";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "Admin authentication required." }, { status: 401 });
  }
  if (!isCertificateStorageConfigured()) {
    return Response.json(
      { error: "Certificate storage is not configured on this deployment." },
      { status: 503 },
    );
  }

  try {
    const certificates = (await listCertificates()).filter(
      (certificate) => certificate.fileUrl,
    );
    if (!certificates.length) {
      return Response.json({ error: "There are no uploaded files to archive." }, { status: 404 });
    }

    const archive: Record<string, Uint8Array> = {};
    for (const certificate of certificates) {
      const response = await fetch(certificate.fileUrl!, { cache: "no-store" });
      if (!response.ok) continue;
      const originalName = certificate.fileName ?? `${certificate.title}.bin`;
      const fileName = uniqueFileName(archive, sanitizeFileName(originalName));
      archive[fileName] = new Uint8Array(await response.arrayBuffer());
    }
    if (!Object.keys(archive).length) {
      return Response.json({ error: "The stored files could not be downloaded." }, { status: 502 });
    }

    const zipped = zipSync(archive, { level: 6 });
    return new Response(Buffer.from(zipped), {
      headers: {
        "content-type": "application/zip",
        "content-disposition": 'attachment; filename="certlery-certificate-files.zip"',
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    console.error("Certificate archive error", error);
    return Response.json(
      { error: "The certificate archive could not be created." },
      { status: 500 },
    );
  }
}

function sanitizeFileName(name: string) {
  return (
    name
      .normalize("NFKD")
      .replace(/[<>:"/\\|?*\u0000-\u001F]+/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 150) || "certificate"
  );
}

function uniqueFileName(files: Record<string, Uint8Array>, requested: string) {
  if (!files[requested]) return requested;
  const dot = requested.lastIndexOf(".");
  const base = dot > 0 ? requested.slice(0, dot) : requested;
  const extension = dot > 0 ? requested.slice(dot) : "";
  let index = 2;
  while (files[`${base}-${index}${extension}`]) index += 1;
  return `${base}-${index}${extension}`;
}
