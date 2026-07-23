import { timingSafeEqual } from "node:crypto";
import { sendTelegramMessage } from "../../../../lib/telegram";

export const runtime = "nodejs";

type TelegramUpdate = {
  message?: {
    text?: string;
    chat?: { id?: number };
    from?: { first_name?: string };
  };
};

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export async function POST(request: Request) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  const received = request.headers.get("x-telegram-bot-api-secret-token") ?? "";
  if (!expected || !safeEqual(received, expected)) {
    return Response.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  const update = (await request.json().catch(() => ({}))) as TelegramUpdate;
  const chatId = update.message?.chat?.id;
  const allowedChatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId || (allowedChatId && String(chatId) !== allowedChatId)) {
    return Response.json({ ok: true });
  }

  const command = update.message?.text?.trim().split(/\s+/)[0]?.toLowerCase();
  const firstName = update.message?.from?.first_name ?? "Admin";
  const replies: Record<string, string> = {
    "/start": `Welcome, ${firstName}. Certlery notifications are connected.`,
    "/help": "Commands: /status, /site, /help",
    "/status": `Certlery is online.\n${new Date().toISOString()}`,
    "/site": "https://certlery.vercel.app",
  };
  if (command && replies[command]) {
    await sendTelegramMessage(replies[command], String(chatId));
  }
  return Response.json({ ok: true });
}

