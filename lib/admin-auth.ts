import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "certlery_admin";
const SESSION_LIFETIME_SECONDS = 60 * 60 * 12;

type AdminSession = {
  username: string;
  expiresAt: number;
};

function credentials() {
  return {
    accounts: configuredAccounts(),
    secret: process.env.ADMIN_SESSION_SECRET ?? "",
  };
}

function configuredAccounts() {
  const accounts: { username: string; password: string }[] = [];
  const raw = process.env.ADMIN_ACCOUNTS;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        for (const value of parsed) {
          if (
            value &&
            typeof value === "object" &&
            typeof (value as { username?: unknown }).username === "string" &&
            typeof (value as { password?: unknown }).password === "string"
          ) {
            const username = (value as { username: string }).username.trim();
            const password = (value as { password: string }).password;
            if (username && password.length >= 12) accounts.push({ username, password });
          }
        }
      }
    } catch {
      // A malformed ADMIN_ACCOUNTS value should not disable the legacy login.
    }
  }

  const username = (process.env.ADMIN_USERNAME ?? "").trim();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (
    username &&
    password.length >= 12 &&
    !accounts.some((account) => account.username === username)
  ) {
    accounts.push({ username, password });
  }
  return accounts;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function encodeSession(session: AdminSession, secret: string) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

function decodeSession(value: string, secret: string): AdminSession | null {
  const [payload, signature] = value.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload, secret))) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Partial<AdminSession>;
    if (
      typeof parsed.username !== "string" ||
      typeof parsed.expiresAt !== "number" ||
      parsed.expiresAt <= Date.now()
    ) {
      return null;
    }
    return { username: parsed.username, expiresAt: parsed.expiresAt };
  } catch {
    return null;
  }
}

export function isAdminConfigured() {
  const { accounts, secret } = credentials();
  return accounts.length > 0 && secret.length >= 32;
}

export function verifyAdminCredentials(username: string, password: string) {
  if (!isAdminConfigured()) return false;
  const configured = credentials();
  return configured.accounts.some(
    (account) =>
      safeEqual(username, account.username) && safeEqual(password, account.password),
  );
}

export async function createAdminSession(username: string) {
  const { secret } = credentials();
  const expiresAt = Date.now() + SESSION_LIFETIME_SECONDS * 1000;
  const store = await cookies();
  store.set(COOKIE_NAME, encodeSession({ username, expiresAt }, secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_LIFETIME_SECONDS,
    path: "/",
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isAdminConfigured()) return null;
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  if (!value) return null;
  return decodeSession(value, credentials().secret);
}
