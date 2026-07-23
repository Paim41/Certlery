import "server-only";

import { del, list, put, type ListBlobResultBlob } from "@vercel/blob";
import {
  defaultGallerySettings,
  type GallerySettings,
} from "../app/lib/gallery-settings";
import { isCertificateStorageConfigured } from "./certificate-store";

const SETTINGS_PREFIX = "certlery/gallery-settings/";
const ASSET_PREFIX = "certlery/gallery-assets/";

export async function getGallerySettings(): Promise<GallerySettings> {
  if (!isCertificateStorageConfigured()) return defaultGallerySettings;

  const blobs = await listAll();
  const newest = blobs.sort(
    (left, right) =>
      new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime(),
  )[0];
  if (!newest) return defaultGallerySettings;

  try {
    const response = await fetch(newest.url, { cache: "no-store" });
    if (!response.ok) return defaultGallerySettings;
    return normalizeSettings(await response.json());
  } catch {
    return defaultGallerySettings;
  }
}

export async function saveGallerySettings(settings: GallerySettings) {
  if (!isCertificateStorageConfigured()) {
    throw new Error("Gallery storage is not configured.");
  }

  const existing = await listAll();
  const saved = await put(
    `${SETTINGS_PREFIX}${Date.now()}-${crypto.randomUUID().slice(0, 8)}.json`,
    JSON.stringify(settings),
    {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    },
  );
  if (existing.length) {
    await del(existing.map((blob) => blob.url)).catch(async (error) => {
      await del(saved.url).catch(() => undefined);
      throw error;
    });
  }
  return settings;
}

export async function saveGalleryProfileImage(file: File) {
  if (!isCertificateStorageConfigured()) {
    throw new Error("Gallery storage is not configured.");
  }

  const current = await getGallerySettings();
  const extension = imageExtension(file.type);
  const uploaded = await put(
    `${ASSET_PREFIX}profile-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`,
    file,
    {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
      cacheControlMaxAge: 60 * 60,
    },
  );

  try {
    const settings = await saveGallerySettings({
      ...current,
      profileImageUrl: uploaded.url,
    });
    if (current.profileImageUrl && current.profileImageUrl !== uploaded.url) {
      await del(current.profileImageUrl).catch(() => undefined);
    }
    return settings;
  } catch (error) {
    await del(uploaded.url).catch(() => undefined);
    throw error;
  }
}

async function listAll() {
  const blobs: ListBlobResultBlob[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: SETTINGS_PREFIX, cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs;
}

function normalizeSettings(value: unknown): GallerySettings {
  if (!value || typeof value !== "object") return defaultGallerySettings;
  const settings = value as Partial<GallerySettings>;
  return {
    title: typeof settings.title === "string" ? settings.title : defaultGallerySettings.title,
    headline: typeof settings.headline === "string" ? settings.headline : defaultGallerySettings.headline,
    bio: typeof settings.bio === "string" ? settings.bio : defaultGallerySettings.bio,
    kicker: typeof settings.kicker === "string" ? settings.kicker : defaultGallerySettings.kicker,
    profileImageUrl:
      typeof settings.profileImageUrl === "string" ? settings.profileImageUrl : undefined,
    contactEmail:
      typeof settings.contactEmail === "string"
        ? settings.contactEmail
        : defaultGallerySettings.contactEmail,
    contactLabel:
      typeof settings.contactLabel === "string"
        ? settings.contactLabel
        : defaultGallerySettings.contactLabel,
    showContactButton:
      typeof settings.showContactButton === "boolean"
        ? settings.showContactButton
        : defaultGallerySettings.showContactButton,
    githubUrl:
      typeof settings.githubUrl === "string"
        ? settings.githubUrl
        : defaultGallerySettings.githubUrl,
    showCertificateCount:
      typeof settings.showCertificateCount === "boolean"
        ? settings.showCertificateCount
        : defaultGallerySettings.showCertificateCount,
  };
}

function imageExtension(contentType: string) {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return "jpg";
}
