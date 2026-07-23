import type { Metadata } from "next";
import { PublicGallery } from "../components/PublicGallery";

export const metadata: Metadata = {
  title: "Certlery Showcase",
  description: "A neutral example of a public Certlery certificate portfolio.",
};

export default function GalleryPage() {
  return <PublicGallery />;
}

