import type { Metadata } from "next";
import { headers } from "next/headers";
import { Cormorant_Garamond, Geist } from "next/font/google";
import { SiteEffects } from "./components/SiteEffects";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${protocol}://${host}` : "https://certlery.example";

  return {
    metadataBase: new URL(origin),
    title: {
      default: "Certlery — Certificate Portfolio",
      template: "%s | Certlery",
    },
    description:
      "Upload, organize, verify, and showcase your certificates in one refined professional gallery.",
    applicationName: "Certlery",
    icons: {
      icon: [{ url: "/certlery-logo.png", type: "image/png" }],
      shortcut: "/certlery-logo.png",
      apple: "/certlery-logo.png",
    },
    openGraph: {
      type: "website",
      title: "Certlery",
      description: "Your achievements, beautifully preserved.",
      images: [{ url: `${origin}/og.png`, width: 1200, height: 630, alt: "Certlery certificate gallery" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Certlery",
      description: "Your achievements, beautifully preserved.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${cormorant.variable} antialiased`}
      >
        {children}
        <SiteEffects />
      </body>
    </html>
  );
}
