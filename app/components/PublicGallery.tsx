"use client";

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
  MapPin,
  Search,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { demoCertificates } from "../lib/demo-certificates";
import { Brand } from "./Brand";
import { CertificateArtwork } from "./CertificateArtwork";

export function PublicGallery() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [copied, setCopied] = useState(false);
  const publicCertificates = demoCertificates.filter((certificate) => certificate.visibility === "public");
  const categories = ["All", ...Array.from(new Set(publicCertificates.map((certificate) => certificate.category)))];
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
          <div><Link href="/demo"><ArrowLeft size={16} /> Dashboard demo</Link><button className="button button-secondary button-small" onClick={copyProfile}>{copied ? <CheckCircle2 size={16} /> : <Share2 size={16} />}{copied ? "Link copied" : "Share profile"}</button></div>
        </div>
      </header>

      <section className="profile-cover">
        <div className="cover-pattern" aria-hidden="true" />
        <div className="shell profile-shell">
          <div className="profile-avatar">MC</div>
          <div className="profile-copy">
            <span className="profile-kicker"><ShieldCheck size={15} /> Public certificate portfolio</span>
            <h1>Maya Chen</h1>
            <p className="profile-headline">Product designer and frontend developer</p>
            <p className="profile-bio">I design useful digital products and build thoughtful interfaces. This gallery brings together the courses, credentials, and awards behind my work.</p>
            <div className="profile-meta"><span><MapPin size={15} /> Kuala Lumpur, Malaysia</span><a href="https://example.com"><LinkIcon size={15} /> mayachen.design</a><a href="https://www.linkedin.com"><Globe2 size={15} /> LinkedIn</a></div>
          </div>
          <div className="profile-actions"><button className="button button-primary"><Mail size={16} /> Contact Maya</button><button className="icon-button" onClick={copyProfile} aria-label="Copy profile link"><Copy size={18} /></button></div>
        </div>
      </section>

      <section className="shell public-content">
        <div className="public-summary">
          <div><span>Certificate portfolio</span><strong>{publicCertificates.length} credentials</strong></div>
          <div><span>Primary fields</span><strong>Design · Development</strong></div>
          <div><span>Latest achievement</span><strong>May 2026</strong></div>
        </div>

        <section className="featured-public">
          <div className="section-heading split-heading">
            <div><span className="eyebrow">Featured credentials</span><h2>A focused view of the work that matters most.</h2></div>
            <p>Selected professional and academic milestones across product design, frontend development, and applied technology.</p>
          </div>
          <div className="public-featured-grid">
            {publicCertificates.filter((certificate) => certificate.featured).map((certificate) => (
              <article key={certificate.id}>
                <CertificateArtwork certificate={certificate} />
                <div><span>{certificate.category}</span><h3>{certificate.title}</h3><p>{certificate.issuer}</p><div><span><ShieldCheck size={14} /> {certificate.verification === "verified" ? "Link confirmed" : "Verification available"}</span><button>View credential <ExternalLink size={14} /></button></div></div>
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
            {visible.map((certificate) => (
              <article key={certificate.id}>
                <CertificateArtwork certificate={certificate} compact={layout === "list"} />
                <div><span className="public-card-category">{certificate.category}</span><h3>{certificate.title}</h3><p>{certificate.issuer}</p><div className="skill-list">{certificate.skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}</div><div className="public-card-foot"><span><ShieldCheck size={14} /> {certificate.verification === "verified" ? "Link confirmed" : "Verification link"}</span><button aria-label={`Open ${certificate.title}`}><ExternalLink size={15} /></button></div></div>
              </article>
            ))}
          </div>
        </section>

        <section className="public-contact">
          <span><BriefcaseBusiness size={22} /></span>
          <div><h2>Interested in working together?</h2><p>See how these credentials connect to Maya’s product and interface work.</p></div>
          <button className="button button-primary"><Mail size={16} /> Get in touch</button>
        </section>
      </section>

      <footer className="public-footer"><div className="shell"><span>Built with <Brand compact /></span><p>Credential verification links are supplied by the profile owner.</p><span><Globe2 size={14} /> Public profile</span></div></footer>
    </main>
  );
}
