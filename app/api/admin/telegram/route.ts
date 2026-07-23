import { getAdminSession } from "../../../../lib/admin-auth";
import {
  configureTelegramWebhook,
  sendTelegramMessage,
  telegramStatus,
} from "../../../../lib/telegram";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Authentication required." }, { status: 401 });
  return Response.json(telegramStatus());
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Authentication required." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { action?: string } | null;
  try {
    if (body?.action === "test") {
      await sendTelegramMessage(
        `<b>Certlery connection test</b>\nTriggered by ${session.username}\n${new Date().toISOString()}`,
      );
      return Response.json({ ok: true, message: "Test message sent." });
    }
    if (body?.action === "configure-webhook") {
      const origin = new URL(request.url).origin;
      await configureTelegramWebhook(origin);
      return Response.json({ ok: true, message: "Webhook connected." });
    }
    return Response.json({ error: "Unknown Telegram action." }, { status: 400 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Telegram action failed." },
      { status: 502 },
    );
  }
}

