import type { Metadata } from "next";
import { PublicGallery } from "../../components/PublicGallery";

export const metadata: Metadata = {
  title: "Maya Chen — Certificate portfolio",
  description: "Professional certificates, courses, and academic awards from Maya Chen.",
};

export default function MayaChenGallery() {
  return <PublicGallery />;
}
