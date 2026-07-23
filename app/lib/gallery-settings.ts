export type GallerySettings = {
  title: string;
  headline: string;
  bio: string;
  showCertificateCount: boolean;
};

export const defaultGallerySettings: GallerySettings = {
  title: "Certlery Showcase",
  headline: "A sample credential portfolio",
  bio: "This public Certlery profile organizes professional certificates, academic awards, skills, and verification details.",
  showCertificateCount: true,
};
