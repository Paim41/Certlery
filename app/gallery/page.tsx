import type { Metadata } from "next";
import { PublicGallery } from "../components/PublicGallery";

export const metadata: Metadata = {
  title: "Sample certificate portfolio",
  description: "A neutral example of a public Certlery certificate portfolio.",
};

export default function GalleryPage() {
  return <PublicGallery />;
}

