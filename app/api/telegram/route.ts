import { z } from "zod";
import {
  escapeTelegram,
  sendTelegramMessage,
  telegramStatus,
} from "../../../lib/telegram";

export const runtime = "nodejs";

const contactInput = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(180),
  message: z.string().trim().min(10).max(1800),
  website: z.string().max(0).optional(),
});

export async function GET() {
  return Response.json({ service: "Certlery Telegram API", ...telegramStatus() });
}

export async function POST(request: Request) {
  const parsed = contactInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: "Please check your name, email, and message." },
      { status: 400 },
    );
  }

  if (parsed.data.website) return Response.json({ ok: true });
  if (!telegramStatus().configured) {
    return Response.json(
      { error: "Messaging is not connected yet. Please use the GitHub link instead." },
      { status: 503 },
    );
  }

  const { name, email, message } = parsed.data;
  try {
    await sendTelegramMessage(
      `<b>New Certlery message</b>\n\n<b>From:</b> ${escapeTelegram(name)}\n<b>Email:</b> ${escapeTelegram(email)}\n\n${escapeTelegram(message)}`,
    );
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Message delivery failed." },
      { status: 502 },
    );
  }
}

