import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Check,
  Eye,
  FileCheck2,
  FolderKanban,
  Globe2,
  ImageIcon,
  Link2,
  LockKeyhole,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { Brand } from "./Brand";

const features = [
  {
    icon: UploadCloud,
    title: "Upload without compromise",
    copy: "Preserve full-quality PDF and image files with clear portrait, landscape, and custom-ratio support.",
  },
  {
    icon: FolderKanban,
    title: "Organize around your story",
    copy: "Group credentials into collections, categories, and skills that make sense to employers and clients.",
  },
  {
    icon: ShieldCheck,
    title: "Present verification clearly",
    copy: "Attach official credential links and show exactly where each verification source comes from.",
  },
  {
    icon: Globe2,
    title: "Share one refined portfolio",
    copy: "Publish a searchable profile or send a direct link to a single certificate or curated collection.",
  },
  {
    icon: BellRing,
    title: "Stay ahead of renewals",
    copy: "Track expiration dates and keep upcoming renewals visible before a credential becomes inactive.",
  },
  {
    icon: LockKeyhole,
    title: "Control every audience",
    copy: "Set each credential and your profile to public, private, or unlisted, with separate download permissions.",
  },
];

export function LandingPage({
  signedIn,
  authEnabled,
}: {
  signedIn: boolean;
  authEnabled: boolean;
}) {
  const dashboardHref = signedIn
    ? "/dashboard"
    : authEnabled
      ? "/signin?return_to=%2Fdashboard"
      : "/demo";

  return (
    <main className="landing">
      <header className="site-header">
        <div className="shell nav-shell">
          <Link href="/" className="brand-link" aria-label="Certlery home">
            <Brand />
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#features">Features</a>
            <Link href="/u/maya-chen">Gallery demo</Link>
            <a href="#how-it-works">How it works</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div className="nav-actions">
            <Link href={dashboardHref} className="text-button">
              {signedIn ? "Dashboard" : "Sign in"}
            </Link>
            <Link href={dashboardHref} className="button button-primary button-small">
              Create gallery
            </Link>
          </div>
        </div>
      </header>

      <section className="hero shell">
        <div className="hero-copy">
          <span className="eyebrow"><FileCheck2 size={15} /> A home for every credential</span>
          <h1>Give every achievement a place to stand out.</h1>
          <p>
            Upload, organize, verify, and showcase your certificates in one refined
            professional gallery.
          </p>
          <div className="hero-actions">
            <Link href={dashboardHref} className="button button-primary">
              Create your gallery <ArrowRight size={17} />
            </Link>
            <Link href="/u/maya-chen" className="button button-secondary">
              View demo gallery
            </Link>
          </div>
          <div className="file-trust">
            <ShieldCheck size={16} />
            <span>Private by default</span>
            <i aria-hidden="true" />
            <span>PDF, PNG, JPG, JPEG, and WebP</span>
          </div>
        </div>

        <div className="hero-gallery" aria-label="Preview of portrait and landscape certificates">
          <div className="hero-certificate landscape tone-gold">
            <div className="certificate-inner">
              <span className="certificate-kicker">Professional certificate</span>
              <strong>UX Design</strong>
              <span className="certificate-line" />
              <small>Issued for professional achievement</small>
              <span className="seal"><Check size={16} /></span>
            </div>
          </div>
          <div className="hero-certificate portrait tone-charcoal">
            <div className="certificate-inner">
              <span className="certificate-kicker">Award of excellence</span>
              <strong>Full Stack Development</strong>
              <span className="certificate-line" />
              <small>Verified credential</small>
              <span className="seal"><Check size={16} /></span>
            </div>
          </div>
          <div className="preview-note">
            <span className="preview-note-icon"><ShieldCheck size={18} /></span>
            <span><strong>Verification link added</strong><small>Source supplied by credential owner</small></span>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Certlery benefits">
        <div className="shell trust-grid">
          <span><FileCheck2 size={17} /> True document proportions</span>
          <span><Eye size={17} /> Granular visibility</span>
          <span><Link2 size={17} /> Shareable credential links</span>
          <span><ShieldCheck size={17} /> Owner-provided verification</span>
        </div>
      </section>

      <section className="section shell gallery-intro">
        <div className="section-heading split-heading">
          <div>
            <span className="eyebrow">A gallery, not a file cabinet</span>
            <h2>Credentials become easier to understand when they are beautifully organized.</h2>
          </div>
          <p>
            Certlery keeps the original certificate at the center, then adds just enough
            context for a viewer to understand its issuer, skills, status, and relevance.
          </p>
        </div>
        <div className="mosaic">
          <div className="mosaic-card mosaic-wide tone-charcoal">
            <CertificateSpec title="Responsive Web Design" issuer="freeCodeCamp" />
          </div>
          <div className="mosaic-card mosaic-tall tone-sand">
            <CertificateSpec title="Dean’s Award" issuer="School of Computing" />
          </div>
          <div className="mosaic-card mosaic-wide tone-blue">
            <CertificateSpec title="Full Stack Developer" issuer="IBM" />
          </div>
          <div className="mosaic-card mosaic-wide tone-sage">
            <CertificateSpec title="Cybersecurity Fundamentals" issuer="Cisco Networking Academy" />
          </div>
        </div>
        <div className="gallery-caption">
          <span><ImageIcon size={17} /> Portrait and landscape formats stay in proportion</span>
          <Link href="/u/maya-chen">Explore the complete demo <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section id="features" className="section section-tinted">
        <div className="shell">
          <div className="section-heading centered">
            <span className="eyebrow">Purpose-built credential tools</span>
            <h2>Everything your certificate collection needs. Nothing it does not.</h2>
            <p>Practical workflows for preserving, finding, validating, and sharing the work behind your achievements.</p>
          </div>
          <div className="feature-grid">
            {features.map(({ icon: Icon, title, copy }) => (
              <article className="feature-card" key={title}>
                <span className="feature-icon"><Icon size={20} /></span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section shell steps-section">
        <div className="section-heading centered compact-heading">
          <span className="eyebrow">How it works</span>
          <h2>From file to professional gallery in three clear steps.</h2>
        </div>
        <div className="steps">
          <article>
            <span className="step-number">01</span>
            <h3>Add your certificates</h3>
            <p>Upload a document or enter the details manually. Certlery keeps the file’s natural orientation.</p>
          </article>
          <article>
            <span className="step-number">02</span>
            <h3>Add the useful context</h3>
            <p>Attach the issuer, dates, credential ID, skills, collection, and official verification link.</p>
          </article>
          <article>
            <span className="step-number">03</span>
            <h3>Share on your terms</h3>
            <p>Feature the work that matters, choose visibility, and share a polished profile or direct link.</p>
          </article>
        </div>
      </section>

      <section id="pricing" className="section pricing-section">
        <div className="shell pricing-panel">
          <div>
            <span className="eyebrow">Simple from the first certificate</span>
            <h2>Start your professional gallery for free.</h2>
            <p>Build a focused public profile, keep private credentials organized, and upgrade only when your collection grows.</p>
          </div>
          <div className="price-card">
            <span>Personal gallery</span>
            <strong>Free</strong>
            <small>to get started</small>
            <ul>
              <li><Check size={16} /> Public certificate profile</li>
              <li><Check size={16} /> Private and unlisted credentials</li>
              <li><Check size={16} /> Verification and expiration tracking</li>
            </ul>
            <Link href={dashboardHref} className="button button-primary">Create your gallery</Link>
          </div>
        </div>
      </section>

      <section className="final-cta shell">
        <span className="cta-seal"><FileCheck2 size={30} /></span>
        <h2>Your work deserves more than a folder.</h2>
        <p>Give every course, award, and professional milestone a clear place in your story.</p>
        <Link href={dashboardHref} className="button button-primary">
          Build your Certlery gallery <ArrowRight size={17} />
        </Link>
      </section>

      <footer className="site-footer">
        <div className="shell footer-grid">
          <div>
            <Brand compact />
            <p>Your achievements, beautifully preserved.</p>
          </div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <Link href="/u/maya-chen">Demo gallery</Link>
            <a href="#how-it-works">How it works</a>
            <a href="#pricing">Pricing</a>
          </div>
          <span className="copyright">© 2026 Certlery</span>
        </div>
      </footer>
    </main>
  );
}

function CertificateSpec({ title, issuer }: { title: string; issuer: string }) {
  return (
    <div className="certificate-inner">
      <span className="certificate-kicker">Certificate of achievement</span>
      <strong>{title}</strong>
      <span className="certificate-line" />
      <small>{issuer}</small>
      <span className="seal"><Check size={14} /></span>
    </div>
  );
}
