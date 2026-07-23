export type GallerySettings = {
  title: string;
  headline: string;
  bio: string;
  kicker: string;
  profileImageUrl?: string;
  contactEmail: string;
  contactLabel: string;
  showContactButton: boolean;
  githubUrl: string;
  showCertificateCount: boolean;
};

export const defaultGallerySettings: GallerySettings = {
  title: "Certlery Showcase",
  headline: "A sample credential portfolio",
  bio: "This public Certlery profile organizes professional certificates, academic awards, skills, and verification details.",
  kicker: "Example public portfolio",
  contactEmail: "",
  contactLabel: "Contact Certlery",
  showContactButton: true,
  githubUrl: "https://github.com/Paim41",
  showCertificateCount: true,
};
