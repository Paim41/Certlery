import "server-only";

import { del, list, put, type ListBlobResultBlob } from "@vercel/blob";
import type { CertificateRecord } from "../app/lib/demo-certificates";

const RECORD_PREFIX = "certlery/records/";
const FILE_PREFIX = "certlery/files/";

type RecordEntry = {
  certificate: CertificateRecord;
  blob: ListBlobResultBlob;
};

type CertificatePatch = Pick<
  CertificateRecord,
  "visibility" | "featured" | "allowDownload"
>;

export function isCertificateStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export async function listCertificates(): Promise<CertificateRecord[]> {
  assertConfigured();

  const [entries, fileBlobs] = await Promise.all([
    readRecordEntries(),
    listAll(FILE_PREFIX),
  ]);
  const fileSizes = new Map(fileBlobs.map((blob) => [blob.url, blob.size]));
  const latest = new Map<string, RecordEntry>();

  for (const entry of entries) {
    const current = latest.get(entry.certificate.id);
    if (!current || recordTime(entry) > recordTime(current)) {
      latest.set(entry.certificate.id, entry);
    }
  }

  return [...latest.values()]
    .map(({ certificate }) => ({
      ...certificate,
      fileSize: certificate.fileSize ?? (
        certificate.fileUrl ? fileSizes.get(certificate.fileUrl) : undefined
      ),
    }))
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

  const now = new Date().toISOString();
  const completed: CertificateRecord = {
    ...certificate,
    fileUrl: uploadedFile.url,
    downloadUrl: uploadedFile.downloadUrl,
    fileName: file.name,
    mimeType: file.type,
    fileSize: file.size,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await writeRecord(completed);
  } catch (error) {
    await del(uploadedFile.url).catch(() => undefined);
    throw error;
  }

  return completed;
}

export async function saveCertificateRecord(
  certificate: CertificateRecord,
): Promise<CertificateRecord> {
  assertConfigured();
  const now = new Date().toISOString();
  const completed: CertificateRecord = {
    ...certificate,
    createdAt: certificate.createdAt ?? now,
    updatedAt: now,
  };
  await writeRecord(completed);
  return completed;
}

export async function updateCertificate(
  id: string,
  patch: Partial<CertificatePatch>,
): Promise<CertificateRecord | null> {
  assertConfigured();

  const entries = await readRecordEntries();
  const matches = entries.filter((entry) => entry.certificate.id === id);
  if (!matches.length) return null;

  const current = matches.reduce((latest, entry) => (
    recordTime(entry) > recordTime(latest) ? entry : latest
  ));
  const updated: CertificateRecord = {
    ...current.certificate,
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };

  const newRecord = await writeRecord(updated);
  await del(matches.map((entry) => entry.blob.url)).catch(async (error) => {
    await del(newRecord.url).catch(() => undefined);
    throw error;
  });
  return updated;
}

export async function deleteCertificate(id: string) {
  assertConfigured();

  const entries = await readRecordEntries();
  const matches = entries.filter((entry) => entry.certificate.id === id);
  if (!matches.length) return false;

  const targets = new Set(matches.map((entry) => entry.blob.url));
  for (const { certificate } of matches) {
    if (certificate.fileUrl) targets.add(certificate.fileUrl);
  }
  await del([...targets]);
  return true;
}

async function writeRecord(certificate: CertificateRecord) {
  const revision = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  return put(
    `${RECORD_PREFIX}${certificate.id}/${revision}.json`,
    JSON.stringify(certificate),
    {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    },
  );
}

async function readRecordEntries(): Promise<RecordEntry[]> {
  const blobs = await listAll(RECORD_PREFIX);
  const entries = await Promise.all(
    blobs.map(async (blob): Promise<RecordEntry | null> => {
      try {
        const response = await fetch(blob.url, { cache: "no-store" });
        if (!response.ok) return null;
        const certificate = normalizeRecord(await response.json());
        return certificate ? { certificate, blob } : null;
      } catch {
        return null;
      }
    }),
  );
  return entries.filter((entry): entry is RecordEntry => entry !== null);
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

function recordTime(entry: RecordEntry) {
  const metadataTime = Date.parse(
    entry.certificate.updatedAt ??
      entry.certificate.createdAt ??
      entry.certificate.issueDate,
  );
  return Number.isFinite(metadataTime)
    ? metadataTime
    : new Date(entry.blob.uploadedAt).getTime();
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
