import type { Metadata } from "next";
import { PublicGallery } from "../components/PublicGallery";
import { demoCertificates, type CertificateRecord } from "../lib/demo-certificates";
import {
  isCertificateStorageConfigured,
  listCertificates,
} from "../../lib/certificate-store";

export const metadata: Metadata = {
  title: "Certlery Showcase",
  description: "A neutral example of a public Certlery certificate portfolio.",
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  let published: CertificateRecord[] = [];
  if (isCertificateStorageConfigured()) {
    try {
      published = (await listCertificates()).filter(
        (certificate) => certificate.visibility === "public",
      );
    } catch (error) {
      console.error("Public certificate gallery error", error);
    }
  }

  const publishedIds = new Set(published.map((certificate) => certificate.id));
  const certificates = [
    ...published,
    ...demoCertificates.filter((certificate) => !publishedIds.has(certificate.id)),
  ];

  return <PublicGallery certificates={certificates} />;
}
