import type { Metadata } from "next";
import { PublicGallery } from "../components/PublicGallery";
import { demoCertificates, type CertificateRecord } from "../lib/demo-certificates";
import {
  isCertificateStorageConfigured,
  listCertificates,
} from "../../lib/certificate-store";
import { getGallerySettings } from "../../lib/gallery-settings-store";

export const metadata: Metadata = {
  title: "Certlery Showcase",
  description: "A neutral example of a public Certlery certificate portfolio.",
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  let published: CertificateRecord[] = [];
  const settings = await getGallerySettings();
  if (isCertificateStorageConfigured()) {
    try {
      published = (await listCertificates()).filter(
        (certificate) => certificate.visibility === "public",
      );
    } catch (error) {
      console.error("Public certificate gallery error", error);
    }
  }

  const certificates = published.length ? published : demoCertificates;

  return <PublicGallery certificates={certificates} settings={settings} />;
}
