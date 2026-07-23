import { z } from "zod";
import { getAdminSession } from "../../../lib/admin-auth";
import {
  isCertificateStorageConfigured,
  listCertificates,
  saveCertificate,
} from "../../../lib/certificate-store";
import type { CertificateRecord } from "../../lib/demo-certificates";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const acceptedTypes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const certificateInput = z.object({
  title: z.string().trim().min(2).max(160),
  issuer: z.string().trim().min(2).max(160),
  issueDate: z.iso.date(),
  expirationDate: z.union([z.literal(""), z.iso.date()]).optional(),
  credentialId: z.string().trim().max(120).optional(),
  verificationUrl: z.union([
    z.literal(""),
    z.url().refine((value) => value.startsWith("https://") || value.startsWith("http://")),
  ]),
  category: z.string().trim().min(1).max(80),
  skills: z.string().max(500).optional(),
  orientation: z.enum(["portrait", "landscape", "square"]),
  visibility: z.enum(["public", "private", "unlisted"]),
  featured: z.boolean(),
  allowDownload: z.boolean(),
});

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  if (!isCertificateStorageConfigured()) return storageUnavailable();

  try {
    return Response.json({ certificates: await listCertificates() });
  } catch (error) {
    return storageError(error);
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  if (!isCertificateStorageConfigured()) return storageUnavailable();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "The upload request is invalid." }, { status: 400 });
  }

  const rawMetadata = form.get("metadata");
  if (typeof rawMetadata !== "string") {
    return Response.json({ error: "Certificate metadata is required." }, { status: 400 });
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawMetadata);
  } catch {
    return Response.json({ error: "Certificate metadata is invalid." }, { status: 400 });
  }

  const parsed = certificateInput.safeParse(parsedJson);
  if (!parsed.success) {
    return Response.json(
      { error: "Review the certificate title, issuer, dates, and verification URL." },
      { status: 400 },
    );
  }

  const fileValue = form.get("file");
  const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
  if (!file) {
    return Response.json({ error: "Choose a certificate file to publish." }, { status: 400 });
  }
  if (!acceptedTypes.has(file.type) || file.size > MAX_FILE_SIZE) {
    return Response.json(
      { error: "Use a PDF, PNG, JPG, JPEG, or WebP file no larger than 10 MB." },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const certificate: CertificateRecord = {
    id: crypto.randomUUID(),
    title: data.title,
    issuer: data.issuer,
    issueDate: data.issueDate,
    expirationDate: data.expirationDate || undefined,
    credentialId: data.credentialId || undefined,
    verificationUrl: data.verificationUrl || undefined,
    category: data.category,
    collection: "New certificates",
    skills:
      data.skills
        ?.split(",")
        .map((skill) => skill.trim())
        .filter(Boolean) ?? [],
    orientation: data.orientation,
    fileType: file.type === "application/pdf" ? "pdf" : "image",
    visibility: data.visibility,
    verification: data.verificationUrl ? "link" : "unavailable",
    featured: data.featured,
    allowDownload: data.allowDownload,
    description: "Recently added certificate.",
    tone: "gold",
  };

  try {
    const saved = await saveCertificate(certificate, file);
    return Response.json({ certificate: saved }, { status: 201 });
  } catch (error) {
    return storageError(error);
  }
}

async function requireAdmin() {
  const session = await getAdminSession();
  return session
    ? null
    : Response.json({ error: "Admin authentication required." }, { status: 401 });
}

function storageUnavailable() {
  return Response.json(
    { error: "Certificate storage is not configured on this deployment." },
    { status: 503 },
  );
}

function storageError(error: unknown) {
  console.error("Certificate storage error", error);
  return Response.json(
    { error: "Certificate storage is temporarily unavailable. Please try again." },
    { status: 500 },
  );
}
