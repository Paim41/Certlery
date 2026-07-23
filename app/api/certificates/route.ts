import { env } from "cloudflare:workers";
import { z } from "zod";
import { getChatGPTUser } from "../../chatgpt-auth";

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

async function ensureCertificateTable() {
  const database = env.DB;
  await database.batch([
    database
      .prepare(`CREATE TABLE IF NOT EXISTS certificates (
        id TEXT PRIMARY KEY,
        user_email TEXT NOT NULL,
        title TEXT NOT NULL,
        issuing_organization TEXT NOT NULL,
        certificate_type TEXT NOT NULL DEFAULT 'Certificate',
        issue_date TEXT NOT NULL,
        expiration_date TEXT,
        credential_id TEXT,
        verification_url TEXT,
        verification_status TEXT NOT NULL DEFAULT 'link_available',
        category TEXT NOT NULL DEFAULT 'Professional',
        collection TEXT,
        skills TEXT NOT NULL DEFAULT '[]',
        description TEXT NOT NULL DEFAULT '',
        private_notes TEXT NOT NULL DEFAULT '',
        file_key TEXT,
        file_name TEXT,
        file_type TEXT NOT NULL DEFAULT 'image',
        orientation TEXT NOT NULL DEFAULT 'landscape',
        rotation INTEGER NOT NULL DEFAULT 0,
        visibility TEXT NOT NULL DEFAULT 'private',
        allow_download INTEGER NOT NULL DEFAULT 1,
        show_credential_id INTEGER NOT NULL DEFAULT 1,
        is_featured INTEGER NOT NULL DEFAULT 0,
        is_draft INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`),
    database.prepare(
      "CREATE INDEX IF NOT EXISTS certificates_owner_idx ON certificates (user_email, created_at)",
    ),
  ]);
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

  await ensureCertificateTable();
  const result = await env.DB.prepare(
    `SELECT id, title, issuing_organization, issue_date, expiration_date,
      credential_id, verification_url, verification_status, category, collection,
      skills, file_name, file_type, orientation, visibility, allow_download,
      is_featured, description, created_at
     FROM certificates
     WHERE user_email = ?
     ORDER BY created_at DESC`,
  )
    .bind(user.email)
    .all();

  return Response.json({ certificates: result.results });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

  const form = await request.formData();
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
    return Response.json({ error: "Review the highlighted certificate details." }, { status: 400 });
  }

  const fileValue = form.get("file");
  const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
  if (file && (!acceptedTypes.has(file.type) || file.size > 10 * 1024 * 1024)) {
    return Response.json(
      { error: "Use a PDF, PNG, JPG, JPEG, or WebP file no larger than 10 MB." },
      { status: 400 },
    );
  }

  await ensureCertificateTable();
  const id = crypto.randomUUID();
  const extension = file?.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) || "bin";
  const fileKey = file ? `${encodeURIComponent(user.email)}/${id}.${extension}` : null;
  if (file && fileKey) {
    await env.CERTIFICATE_FILES.put(fileKey, file.stream(), {
      httpMetadata: { contentType: file.type, contentDisposition: `inline; filename="${file.name.replace(/["\r\n]/g, "")}"` },
      customMetadata: { owner: user.email, certificateId: id },
    });
  }

  const data = parsed.data;
  await env.DB.prepare(
    `INSERT INTO certificates (
      id, user_email, title, issuing_organization, issue_date, expiration_date,
      credential_id, verification_url, verification_status, category, collection,
      skills, description, file_key, file_name, file_type, orientation, visibility,
      allow_download, is_featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      user.email,
      data.title,
      data.issuer,
      data.issueDate,
      data.expirationDate || null,
      data.credentialId || null,
      data.verificationUrl || null,
      data.verificationUrl ? "link_available" : "unavailable",
      data.category,
      "New certificates",
      JSON.stringify(
        data.skills
          ?.split(",")
          .map((skill) => skill.trim())
          .filter(Boolean) ?? [],
      ),
      "Recently added certificate.",
      fileKey,
      file?.name ?? null,
      file?.type === "application/pdf" ? "pdf" : "image",
      data.orientation,
      data.visibility,
      data.allowDownload ? 1 : 0,
      data.featured ? 1 : 0,
    )
    .run();

  return Response.json({ certificate: { id, ...data, fileName: file?.name ?? null } }, { status: 201 });
}
