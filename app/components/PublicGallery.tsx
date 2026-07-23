"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe2,
  Grid2X2,
  Link as LinkIcon,
  List,
  Mail,
  Search,
  Share2,
  ShieldCheck,
  X,
} from "lucide-react";
import { demoCertificates, type CertificateRecord } from "../lib/demo-certificates";
import { Brand } from "./Brand";
import { CertificateArtwork } from "./CertificateArtwork";

export function PublicGallery({
  certificates = demoCertificates,
}: {
  certificates?: CertificateRecord[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState<CertificateRecord | null>(null);
  const publicCertificates = useMemo(
    () => certificates.filter((certificate) => certificate.visibility === "public"),
    [certificates],
  );
  const categories = ["All", ...Array.from(new Set(publicCertificates.map((certificate) => certificate.category)))];
  const primaryFields = categories.slice(1, 3).join(" · ") || "Professional credentials";
  const newestCertificate = [...publicCertificates].sort(
    (left, right) => Date.parse(right.issueDate) - Date.parse(left.issueDate),
  )[0];
  const visible = useMemo(
    () =>
      publicCertificates.filter(
        (certificate) =>
          (category === "All" || certificate.category === category) &&
          (!query ||
            `${certificate.title} ${certificate.issuer} ${certificate.skills.join(" ")}`
              .toLowerCase()
              .includes(query.toLowerCase())),
      ),
    [category, publicCertificates, query],
  );

  async function copyProfile() {
    await navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);
  }

  return (
    <main className="public-gallery">
      <header className="public-nav">
        <div className="shell">
          <Link href="/" className="brand-link"><Brand compact /></Link>
          <div><Link href="/"><ArrowLeft size={16} /> Back to Certlery</Link><button className="button button-secondary button-small" onClick={copyProfile} data-ripple>{copied ? <CheckCircle2 size={16} /> : <Share2 size={16} />}{copied ? "Link copied" : "Share profile"}</button></div>
        </div>
      </header>

      <section className="profile-cover">
        <div className="cover-pattern" aria-hidden="true" />
        <div className="shell profile-shell">
          <div className="profile-avatar profile-avatar-image">
            <Image
              src="/certlery-showcase-profile.png"
              alt="Certlery Showcase profile"
              fill
              sizes="(max-width: 680px) 80px, 105px"
              priority
            />
          </div>
          <div className="profile-copy">
            <span className="profile-kicker"><ShieldCheck size={15} /> Example public portfolio</span>
            <h1>Certlery Showcase</h1>
            <p className="profile-headline">A sample credential portfolio</p>
            <p className="profile-bio">This neutral example shows how a real public Certlery profile can organize professional certificates, academic awards, skills, and verification details.</p>
            <div className="profile-meta"><span><Globe2 size={15} /> Public certificate gallery</span><span><LinkIcon size={15} /> {publicCertificates.length} published credentials</span></div>
          </div>
          <div className="profile-actions"><Link href="/#contact" className="button button-primary"><Mail size={16} /> Contact Certlery</Link><button className="icon-button" onClick={copyProfile} aria-label="Copy profile link"><Copy size={18} /></button></div>
        </div>
      </section>

      <section className="shell public-content">
        <div className="public-summary">
          <div><span>Certificate portfolio</span><strong>{publicCertificates.length} credentials</strong></div>
          <div><span>Primary fields</span><strong>{primaryFields}</strong></div>
          <div><span>Latest achievement</span><strong>{newestCertificate ? new Date(newestCertificate.issueDate).toLocaleDateString("en", { month: "short", year: "numeric" }) : "No certificates yet"}</strong></div>
        </div>

        <section className="featured-public">
          <div className="section-heading split-heading">
            <div><span className="eyebrow">Featured credentials</span><h2>A focused view of the work that matters most.</h2></div>
            <p>Selected professional and academic milestones across product design, frontend development, and applied technology.</p>
          </div>
          <div className="public-featured-grid">
            {publicCertificates.filter((certificate) => certificate.featured).map((certificate, index) => (
              <article key={certificate.id} data-tilt data-reveal style={{ "--stagger": index } as React.CSSProperties}>
                <span className="card-shine" aria-hidden="true" />
                <CertificateArtwork certificate={certificate} />
                <div><span>{certificate.category}</span><h3>{certificate.title}</h3><p>{certificate.issuer}</p><div><span><ShieldCheck size={14} /> {certificate.verification === "verified" ? "Link confirmed" : "Verification available"}</span><button onClick={() => setPreview(certificate)}>Quick preview <ExternalLink size={14} /></button></div></div>
              </article>
            ))}
          </div>
        </section>

        <section className="all-credentials">
          <div className="public-section-head"><div><span className="eyebrow">Complete gallery</span><h2>Certificates and awards</h2></div><div className="view-switcher"><button className={layout === "grid" ? "active" : ""} onClick={() => setLayout("grid")} aria-label="Grid view"><Grid2X2 size={17} /></button><button className={layout === "list" ? "active" : ""} onClick={() => setLayout("list")} aria-label="List view"><List size={18} /></button></div></div>
          <div className="public-filters">
            <label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search certificates and skills" /></label>
            <div>{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
          </div>
          <div className={`public-certificate-grid ${layout === "list" ? "is-list" : ""}`}>
            {visible.map((certificate, index) => (
              <article key={certificate.id} data-tilt data-reveal style={{ "--stagger": index } as React.CSSProperties}>
                <span className="card-shine" aria-hidden="true" />
                <CertificateArtwork certificate={certificate} compact={layout === "list"} />
                <div><span className="public-card-category">{certificate.category}</span><h3>{certificate.title}</h3><p>{certificate.issuer}</p><div className="skill-list">{certificate.skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}</div><div className="public-card-foot"><span><ShieldCheck size={14} /> {certificate.verification === "verified" ? "Link confirmed" : "Verification link"}</span><button onClick={() => setPreview(certificate)} aria-label={`Preview ${certificate.title}`}><ExternalLink size={15} /></button></div></div>
              </article>
            ))}
          </div>
        </section>

        <section className="public-contact">
          <span><BriefcaseBusiness size={22} /></span>
          <div><h2>Want a portfolio like this?</h2><p>This page is a neutral example of the public layout available in Certlery.</p></div>
          <Link href="/#contact" className="button button-primary" data-ripple><Mail size={16} /> Get in touch</Link>
        </section>
      </section>

      <footer className="public-footer"><div className="shell"><span>Built with <Brand compact /></span><p>Credential verification links are supplied by the profile owner.</p><a href="https://github.com/Paim41" target="_blank" rel="noreferrer"><Globe2 size={14} /> Paim41 on GitHub</a></div></footer>
      {preview && (
        <div className="quick-preview-backdrop" role="presentation" onClick={() => setPreview(null)}>
          <section className="quick-preview" role="dialog" aria-modal="true" aria-labelledby="quick-preview-title" onClick={(event) => event.stopPropagation()}>
            <button className="icon-button quick-preview-close" onClick={() => setPreview(null)} aria-label="Close preview"><X size={19} /></button>
            <div className="quick-preview-art"><CertificateArtwork certificate={preview} /></div>
            <div className="quick-preview-copy">
              <span className="eyebrow">{preview.category}</span>
              <h2 id="quick-preview-title">{preview.title}</h2>
              <p>{preview.issuer}</p>
              <div className="skill-list">{preview.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
              <dl>
                <div><dt>Issued</dt><dd>{new Date(preview.issueDate).toLocaleDateString("en", { month: "long", year: "numeric" })}</dd></div>
                <div><dt>Visibility</dt><dd>{preview.visibility}</dd></div>
                <div><dt>Status</dt><dd>{preview.verification === "verified" ? "Link confirmed" : "Verification link"}</dd></div>
              </dl>
              <button className="button button-primary" onClick={() => setPreview(null)} data-ripple>Close preview</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
