import { z } from "zod";
import { getAdminSession } from "../../../../lib/admin-auth";
import {
  isCertificateStorageConfigured,
  saveCertificateRecord,
} from "../../../../lib/certificate-store";
import type { CertificateRecord } from "../../../lib/demo-certificates";

export const runtime = "nodejs";

const rowInput = z.object({
  title: z.string().trim().min(2).max(160),
  issuer: z.string().trim().min(2).max(160),
  issueDate: z.iso.date(),
  expirationDate: z.union([z.literal(""), z.iso.date()]).optional(),
  credentialId: z.string().trim().max(120).optional(),
  verificationUrl: z.union([z.literal(""), z.url()]).optional(),
  category: z.string().trim().min(1).max(80).default("Imported"),
  skills: z.union([z.string(), z.array(z.string())]).optional(),
  orientation: z.enum(["portrait", "landscape", "square"]).default("landscape"),
  visibility: z.enum(["public", "private", "unlisted"]).default("private"),
  featured: z.boolean().default(false),
  allowDownload: z.boolean().default(true),
});

const importInput = z.object({ rows: z.array(rowInput).min(1).max(250) });

export async function POST(request: Request) {
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

  const parsed = importInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: "The CSV contains missing or invalid title, issuer, or date values." },
      { status: 400 },
    );
  }

  try {
    const certificates = await Promise.all(
      parsed.data.rows.map(async (row): Promise<CertificateRecord> => {
        const skills = Array.isArray(row.skills)
          ? row.skills
          : (row.skills ?? "")
              .split(/[|;]/)
              .map((skill) => skill.trim())
              .filter(Boolean);
        return saveCertificateRecord({
          id: crypto.randomUUID(),
          ownerUsername: session.username,
          title: row.title,
          issuer: row.issuer,
          issueDate: row.issueDate,
          expirationDate: row.expirationDate || undefined,
          credentialId: row.credentialId || undefined,
          verificationUrl: row.verificationUrl || undefined,
          category: row.category,
          skills,
          orientation: row.orientation,
          fileType: "image",
          visibility: row.visibility,
          verification: row.verificationUrl ? "link" : "unavailable",
          featured: row.featured,
          allowDownload: row.allowDownload,
          description: "Imported certificate record.",
          tone: "gold",
        });
      }),
    );
    return Response.json({ certificates }, { status: 201 });
  } catch (error) {
    console.error("Certificate import error", error);
    return Response.json(
      { error: "The certificate records could not be imported." },
      { status: 500 },
    );
  }
}
