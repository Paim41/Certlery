import "server-only";

import { del, list, put, type ListBlobResultBlob } from "@vercel/blob";
import type { CertificateRecord } from "../app/lib/demo-certificates";

const RECORD_PREFIX = "certlery/records/";
const FILE_PREFIX = "certlery/files/";

export function isCertificateStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export async function listCertificates(): Promise<CertificateRecord[]> {
  assertConfigured();

  const recordBlobs = await listAll(RECORD_PREFIX);
  const certificates = await Promise.all(
    recordBlobs.map(async (blob) => {
      try {
        const response = await fetch(blob.url, { cache: "no-store" });
        if (!response.ok) return null;
        return normalizeRecord(await response.json());
      } catch {
        return null;
      }
    }),
  );

  return certificates
    .filter((certificate): certificate is CertificateRecord => certificate !== null)
    .sort((left, right) => {
      const leftTime = Date.parse(left.createdAt ?? left.issueDate);
      const rightTime = Date.parse(right.createdAt ?? right.issueDate);
      return rightTime - leftTime;
    });
}

export async function saveCertificate(
  certificate: CertificateRecord,
  file: File,
): Promise<CertificateRecord> {
  assertConfigured();

  const safeName = sanitizeFileName(file.name);
  const uploadedFile = await put(
    `${FILE_PREFIX}${certificate.id}/${safeName}`,
    file,
    {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
      cacheControlMaxAge: 60 * 60,
    },
  );

  const completed: CertificateRecord = {
    ...certificate,
    fileUrl: uploadedFile.url,
    downloadUrl: uploadedFile.downloadUrl,
    fileName: file.name,
    mimeType: file.type,
    createdAt: new Date().toISOString(),
  };

  try {
    await put(
      `${RECORD_PREFIX}${certificate.id}.json`,
      JSON.stringify(completed),
      {
        access: "public",
        addRandomSuffix: false,
        contentType: "application/json",
        cacheControlMaxAge: 60,
      },
    );
  } catch (error) {
    await del(uploadedFile.url).catch(() => undefined);
    throw error;
  }

  return completed;
}

export async function deleteCertificate(id: string) {
  assertConfigured();

  const recordBlobs = await listAll(`${RECORD_PREFIX}${id}.json`);
  const recordBlob = recordBlobs.find(
    (blob) => blob.pathname === `${RECORD_PREFIX}${id}.json`,
  );
  if (!recordBlob) return false;

  let certificate: CertificateRecord | null = null;
  try {
    const response = await fetch(recordBlob.url, { cache: "no-store" });
    if (response.ok) certificate = normalizeRecord(await response.json());
  } catch {
    certificate = null;
  }

  const targets = [recordBlob.url];
  if (certificate?.fileUrl) targets.push(certificate.fileUrl);
  await del(targets);
  return true;
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

function normalizeRecord(value: unknown): CertificateRecord | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<CertificateRecord>;
  if (
    typeof record.id !== "string" ||
    typeof record.title !== "string" ||
    typeof record.issuer !== "string" ||
    typeof record.issueDate !== "string" ||
    !Array.isArray(record.skills)
  ) {
    return null;
  }
  return record as CertificateRecord;
}

function sanitizeFileName(name: string) {
  const clean = name
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-120);
  return clean || "certificate";
}

function assertConfigured() {
  if (!isCertificateStorageConfigured()) {
    throw new Error("Certificate storage is not configured.");
  }
}
