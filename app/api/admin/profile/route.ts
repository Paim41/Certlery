import { z } from "zod";
import { getAdminSession } from "../../../../lib/admin-auth";
import {
  getAdminProfile,
  saveAdminProfile,
} from "../../../../lib/admin-profile-store";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "Admin authentication required." }, { status: 401 });
  }
  return Response.json({ profile: await getAdminProfile(session.username) });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "Admin authentication required." }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const parsed = z.string().trim().min(2).max(80).safeParse(form?.get("displayName"));
  if (!parsed.success) {
    return Response.json({ error: "Enter a display name between 2 and 80 characters." }, { status: 400 });
  }

  const value = form?.get("file");
  const file = value instanceof File && value.size > 0 ? value : undefined;
  const acceptedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
  if (file && (!acceptedTypes.has(file.type) || file.size > 5 * 1024 * 1024)) {
    return Response.json(
      { error: "Choose a PNG, JPG, or WebP profile image no larger than 5 MB." },
      { status: 400 },
    );
  }

  try {
    return Response.json({
      profile: await saveAdminProfile(session.username, parsed.data, file),
    });
  } catch (error) {
    console.error("Admin profile error", error);
    return Response.json(
      { error: "The admin profile could not be saved." },
      { status: 500 },
    );
  }
}
