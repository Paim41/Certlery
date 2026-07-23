import { z } from "zod";
import { createClient } from "../../../lib/supabase/server";

export const runtime = "nodejs";

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
  const auth = await authenticatedClient();
  if (auth instanceof Response) return auth;

  const { supabase, user } = auth;
  const { data, error } = await supabase
    .from("certificates")
    .select(
      "id,title,issuing_organization,issue_date,expiration_date,credential_id,verification_url,verification_status,category,collection,skills,file_name,file_type,orientation,visibility,allow_download,is_featured,description,created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return databaseError(error.message);
  return Response.json({ certificates: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await authenticatedClient();
  if (auth instanceof Response) return auth;
  const { supabase, user } = auth;

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

  const id = crypto.randomUUID();
  const extension =
    file?.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) || "bin";
  const fileKey = file ? `${user.id}/${id}.${extension}` : null;

  if (file && fileKey) {
    const { error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(fileKey, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      return Response.json(
        { error: `The certificate file could not be uploaded: ${uploadError.message}` },
        { status: 500 },
      );
    }
  }

  const data = parsed.data;
  const { data: certificate, error } = await supabase
    .from("certificates")
    .insert({
      id,
      user_id: user.id,
      title: data.title,
      issuing_organization: data.issuer,
      issue_date: data.issueDate,
      expiration_date: data.expirationDate || null,
      credential_id: data.credentialId || null,
      verification_url: data.verificationUrl || null,
      verification_status: data.verificationUrl ? "link_available" : "unavailable",
      category: data.category,
      collection: "New certificates",
      skills:
        data.skills
          ?.split(",")
          .map((skill) => skill.trim())
          .filter(Boolean) ?? [],
      description: "Recently added certificate.",
      file_key: fileKey,
      file_name: file?.name ?? null,
      file_type: file?.type === "application/pdf" ? "pdf" : "image",
      orientation: data.orientation,
      visibility: data.visibility,
      allow_download: data.allowDownload,
      is_featured: data.featured,
    })
    .select()
    .single();

  if (error) {
    if (fileKey) await supabase.storage.from("certificates").remove([fileKey]);
    return databaseError(error.message);
  }

  return Response.json({ certificate }, { status: 201 });
}

async function authenticatedClient() {
  const supabase = await createClient();
  if (!supabase) {
    return Response.json(
      { error: "Certificate storage is not configured on this deployment." },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  return { supabase, user };
}

function databaseError(message: string) {
  const setupMissing =
    message.includes("relation") ||
    message.includes("schema cache") ||
    message.includes("Could not find the table");
  return Response.json(
    {
      error: setupMissing
        ? "The Supabase schema has not been installed. Run the included migration first."
        : message,
    },
    { status: 500 },
  );
}
