import { z } from "zod";
import { getAdminSession } from "../../../lib/admin-auth";
import {
  getGallerySettings,
  saveGalleryProfileImage,
  saveGallerySettings,
} from "../../../lib/gallery-settings-store";

export const runtime = "nodejs";

const settingsInput = z.object({
  title: z.string().trim().min(2).max(80),
  headline: z.string().trim().min(2).max(120),
  bio: z.string().trim().min(10).max(600),
  kicker: z.string().trim().min(2).max(80),
  profileImageUrl: z.url().optional(),
  contactEmail: z.union([z.literal(""), z.email().max(160)]),
  contactLabel: z.string().trim().min(2).max(60),
  showContactButton: z.boolean(),
  githubUrl: z.union([
    z.literal(""),
    z.url().refine((value) => value.startsWith("https://") || value.startsWith("http://")),
  ]),
  showCertificateCount: z.boolean(),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "Admin authentication required." }, { status: 401 });
  }
  return Response.json({ settings: await getGallerySettings() });
}

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "Admin authentication required." }, { status: 401 });
  }

  const parsed = settingsInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: "Complete the gallery title, headline, and biography." },
      { status: 400 },
    );
  }

  try {
    return Response.json({ settings: await saveGallerySettings(parsed.data) });
  } catch (error) {
    console.error("Gallery settings error", error);
    return Response.json(
      { error: "The gallery profile could not be saved. Please try again." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "Admin authentication required." }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const value = form?.get("file");
  const file = value instanceof File && value.size > 0 ? value : null;
  const acceptedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
  if (!file || !acceptedTypes.has(file.type) || file.size > 5 * 1024 * 1024) {
    return Response.json(
      { error: "Choose a PNG, JPG, or WebP profile image no larger than 5 MB." },
      { status: 400 },
    );
  }

  try {
    return Response.json({ settings: await saveGalleryProfileImage(file) });
  } catch (error) {
    console.error("Gallery profile image error", error);
    return Response.json(
      { error: "The gallery profile image could not be saved." },
      { status: 500 },
    );
  }
}
