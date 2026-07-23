import { z } from "zod";
import { getAdminSession } from "../../../lib/admin-auth";
import {
  getGallerySettings,
  saveGallerySettings,
} from "../../../lib/gallery-settings-store";

export const runtime = "nodejs";

const settingsInput = z.object({
  title: z.string().trim().min(2).max(80),
  headline: z.string().trim().min(2).max(120),
  bio: z.string().trim().min(10).max(600),
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
