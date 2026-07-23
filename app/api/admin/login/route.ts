import { z } from "zod";
import {
  createAdminSession,
  isAdminConfigured,
  verifyAdminCredentials,
} from "../../../../lib/admin-auth";
import { sendTelegramMessage, telegramStatus } from "../../../../lib/telegram";

export const runtime = "nodejs";

const loginInput = z.object({
  username: z.string().trim().min(1).max(120),
  password: z.string().min(1).max(300),
});

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return Response.json(
      { error: "Admin login is not configured on this deployment." },
      { status: 503 },
    );
  }

  const parsed = loginInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Enter your username and password." }, { status: 400 });
  }

  const { username, password } = parsed.data;
  if (!verifyAdminCredentials(username, password)) {
    return Response.json({ error: "The username or password is incorrect." }, { status: 401 });
  }

  await createAdminSession(username);

  if (telegramStatus().configured) {
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    await sendTelegramMessage(
      `<b>Certlery admin sign-in</b>\nUser: ${username}\nIP: ${forwardedFor ?? "Unavailable"}\nTime: ${new Date().toISOString()}`,
    ).catch(() => undefined);
  }

  return Response.json({ ok: true });
}
