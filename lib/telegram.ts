import "server-only";

const TELEGRAM_API = "https://api.telegram.org";

type TelegramResult = {
  ok: boolean;
  description?: string;
};

export function telegramStatus() {
  return {
    configured: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    webhookSecured: Boolean(process.env.TELEGRAM_WEBHOOK_SECRET),
  };
}

export async function sendTelegramMessage(text: string, chatId = process.env.TELEGRAM_CHAT_ID) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) {
    throw new Error("Telegram is not configured.");
  }

  const response = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
    cache: "no-store",
  });
  const result = (await response.json()) as TelegramResult;
  if (!response.ok || !result.ok) {
    throw new Error(result.description ?? "Telegram rejected the message.");
  }
  return result;
}

export async function configureTelegramWebhook(origin: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!token || !secretToken) throw new Error("Telegram webhook settings are incomplete.");

  const response = await fetch(`${TELEGRAM_API}/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: `${origin.replace(/\/$/, "")}/api/telegram/webhook`,
      secret_token: secretToken,
      allowed_updates: ["message"],
      drop_pending_updates: true,
    }),
    cache: "no-store",
  });
  const result = (await response.json()) as TelegramResult;
  if (!response.ok || !result.ok) {
    throw new Error(result.description ?? "Telegram rejected the webhook.");
  }
  return result;
}

export function escapeTelegram(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

