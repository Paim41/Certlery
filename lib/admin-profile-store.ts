import "server-only";

import { del, list, put, type ListBlobResultBlob } from "@vercel/blob";
import type { AdminProfile } from "../app/lib/admin-profile";
import { isCertificateStorageConfigured } from "./certificate-store";

function profilePrefix(username: string) {
  return `certlery/admin-profiles/${safeSegment(username)}/`;
}

export async function getAdminProfile(username: string): Promise<AdminProfile> {
  const fallback = { username, displayName: username };
  if (!isCertificateStorageConfigured()) return fallback;

  const blobs = await listAll(`${profilePrefix(username)}records/`);
  const newest = blobs.sort(
    (left, right) =>
      new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime(),
  )[0];
  if (!newest) return fallback;

  try {
    const response = await fetch(newest.url, { cache: "no-store" });
    if (!response.ok) return fallback;
    const value = (await response.json()) as Partial<AdminProfile>;
    return {
      username,
      displayName:
        typeof value.displayName === "string" && value.displayName.trim()
          ? value.displayName.trim()
          : username,
      avatarUrl: typeof value.avatarUrl === "string" ? value.avatarUrl : undefined,
    };
  } catch {
    return fallback;
  }
}

export async function saveAdminProfile(
  username: string,
  displayName: string,
  avatarFile?: File,
) {
  if (!isCertificateStorageConfigured()) {
    throw new Error("Admin profile storage is not configured.");
  }

  const current = await getAdminProfile(username);
  let uploadedUrl: string | undefined;
  if (avatarFile) {
    const extension =
      avatarFile.type === "image/png"
        ? "png"
        : avatarFile.type === "image/webp"
          ? "webp"
          : "jpg";
    const uploaded = await put(
      `${profilePrefix(username)}avatar/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`,
      avatarFile,
      {
        access: "public",
        addRandomSuffix: false,
        contentType: avatarFile.type,
        cacheControlMaxAge: 60 * 60,
      },
    );
    uploadedUrl = uploaded.url;
  }

  const profile: AdminProfile = {
    username,
    displayName: displayName.trim() || username,
    avatarUrl: uploadedUrl ?? current.avatarUrl,
  };
  const records = await listAll(`${profilePrefix(username)}records/`);

  try {
    const saved = await put(
      `${profilePrefix(username)}records/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.json`,
      JSON.stringify(profile),
      {
        access: "public",
        addRandomSuffix: false,
        contentType: "application/json",
        cacheControlMaxAge: 60,
      },
    );
    if (records.length) {
      await del(records.map((record) => record.url)).catch(async (error) => {
        await del(saved.url).catch(() => undefined);
        throw error;
      });
    }
    if (uploadedUrl && current.avatarUrl && current.avatarUrl !== uploadedUrl) {
      await del(current.avatarUrl).catch(() => undefined);
    }
    return profile;
  } catch (error) {
    if (uploadedUrl) await del(uploadedUrl).catch(() => undefined);
    throw error;
  }
}

async function listAll(prefix: string) {
  const blobs: ListBlobResultBlob[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs;
}

function safeSegment(value: string) {
  return (
    value
      .normalize("NFKD")
      .replace(/[^\w.-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "admin"
  );
}
