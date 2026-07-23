import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Check,
  Code2,
  Eye,
  FileCheck2,
  FolderKanban,
  Globe2,
  ImageIcon,
  Link2,
  LockKeyhole,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { Brand } from "./Brand";
import { ContactForm } from "./ContactForm";

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

const stats = [
  { value: 8, suffix: "", label: "Sample credentials", copy: "Across academic and professional work" },
  { value: 5, suffix: "", label: "Publicly visible", copy: "Ready to share in the portfolio" },
  { value: 3, suffix: "", label: "Featured highlights", copy: "Selected for the first impression" },
  { value: 2, suffix: "", label: "Renewal reminders", copy: "Dates that need attention soon" },
];

export function LandingPage() {
  const adminHref = "/admin/login";

  return (
    <main className="landing">
      <div className="ambient-layer" aria-hidden="true">
        <span className="ambient-blob blob-one" />
        <span className="ambient-blob blob-two" />
        <span className="ambient-blob blob-three" />
        {Array.from({ length: 14 }, (_, index) => (
          <i
            key={index}
            style={{
              top: `${140 + index * 320}px`,
              left: `${3 + ((index * 23) % 91)}%`,
              width: `${3 + (index % 4)}px`,
              height: `${3 + (index % 4)}px`,
              animationDelay: `${index * -0.7}s`,
            }}
          />
        ))}
      </div>

      <header className="site-header">
        <div className="nav-cursor-glow" aria-hidden="true" />
        <div className="shell nav-shell">
          <Link href="/" className="brand-link" aria-label="Certlery home">
            <Brand />
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#gallery">Gallery</a>
            <a href="#statistics">Snapshot</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="nav-actions">
            <Link href={adminHref} className="text-button">Admin</Link>
            <Link href="/gallery" className="button button-primary button-small" data-ripple>
              Sample portfolio
            </Link>
          </div>
        </div>
      </header>

      <section className="hero-stage">
        <div className="hero-spotlight" aria-hidden="true" />
        <div className="aurora aurora-one" aria-hidden="true" />
        <div className="aurora aurora-two" aria-hidden="true" />
        <div className="hero shell">
          <div className="hero-copy">
            <span className="eyebrow hero-reveal reveal-one">
              <Sparkles size={15} /> A living home for every credential
            </span>
            <h1 className="hero-reveal reveal-two">
              Give every achievement a place to <em>stand out.</em>
            </h1>
            <p className="hero-reveal reveal-three">
              Upload, organize, verify, and showcase your certificates in one refined
              professional gallery—now with secure live administration and Telegram events.
            </p>
            <div className="hero-actions hero-reveal reveal-four">
              <Link
                href="/gallery"
                className="button button-primary button-glow"
                data-ripple
                data-magnetic
              >
                View sample portfolio <ArrowRight size={17} />
              </Link>
              <a href="#contact" className="button button-secondary" data-ripple data-magnetic>
                Send a live message
              </a>
            </div>
            <div className="file-trust hero-reveal reveal-five">
              <ShieldCheck size={16} />
              <span>Env-secured admin</span>
              <i aria-hidden="true" />
              <span>Telegram API ready</span>
            </div>
          </div>

          <div className="hero-gallery hero-reveal reveal-gallery" aria-label="Preview of portrait and landscape certificates">
            <div className="hero-orbit orbit-one" aria-hidden="true" />
            <div className="hero-orbit orbit-two" aria-hidden="true" />
            <div className="hero-certificate landscape tone-gold" data-tilt>
              <div className="card-shine" aria-hidden="true" />
              <div className="certificate-inner">
                <span className="certificate-kicker">Professional certificate</span>
                <strong>UX Design</strong>
                <span className="certificate-line" />
                <small>Issued for professional achievement</small>
                <span className="seal"><Check size={16} /></span>
              </div>
            </div>
            <div className="hero-certificate portrait tone-charcoal" data-tilt>
              <div className="card-shine" aria-hidden="true" />
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
              <span>
                <strong>Verification link added</strong>
                <small>Source supplied by credential owner</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Certlery benefits">
        <div className="shell trust-grid" data-reveal>
          <span><FileCheck2 size={17} /> True document proportions</span>
          <span><Eye size={17} /> Granular visibility</span>
          <span><Link2 size={17} /> Shareable credential links</span>
          <span><MessageCircleMore size={17} /> Telegram notifications</span>
        </div>
      </section>

      <section id="gallery" className="section shell gallery-intro">
        <div className="section-heading split-heading" data-reveal>
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
          <div className="mosaic-card mosaic-wide tone-charcoal" data-tilt data-reveal>
            <div className="card-shine" aria-hidden="true" />
            <CertificateSpec title="Responsive Web Design" issuer="freeCodeCamp" />
          </div>
          <div className="mosaic-card mosaic-tall tone-sand" data-tilt data-reveal>
            <div className="card-shine" aria-hidden="true" />
            <CertificateSpec title="Dean’s Award" issuer="School of Computing" />
          </div>
          <div className="mosaic-card mosaic-wide tone-blue" data-tilt data-reveal>
            <div className="card-shine" aria-hidden="true" />
            <CertificateSpec title="Full Stack Developer" issuer="IBM" />
          </div>
          <div className="mosaic-card mosaic-wide tone-sage" data-tilt data-reveal>
            <div className="card-shine" aria-hidden="true" />
            <CertificateSpec title="Cybersecurity Fundamentals" issuer="Cisco Networking Academy" />
          </div>
        </div>
        <div className="gallery-caption" data-reveal>
          <span><ImageIcon size={17} /> Portrait and landscape formats stay in proportion</span>
          <Link href="/gallery">See the public portfolio layout <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section id="statistics" className="section statistics-section">
        <div className="shell">
          <div className="section-heading centered" data-reveal>
            <span className="eyebrow">Sample workspace snapshot</span>
            <h2>A practical overview of what the example collection contains.</h2>
            <p>These numbers describe the sample credentials shown in Certlery. They are not invented performance claims.</p>
          </div>
          <div className="statistics-grid">
            {stats.map((stat, index) => (
              <article className="stat-snapshot" key={stat.label} data-reveal style={{ "--stagger": index } as React.CSSProperties}>
                <span className="stat-snapshot-number" data-count={stat.value} data-suffix={stat.suffix}>0{stat.suffix}</span>
                <div>
                  <strong>{stat.label}</strong>
                  <p>{stat.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="section section-tinted">
        <div className="shell">
          <div className="section-heading centered" data-reveal>
            <span className="eyebrow">Purpose-built credential tools</span>
            <h2>Everything your certificate collection needs. Nothing it does not.</h2>
            <p>Practical workflows for preserving, finding, validating, and sharing the work behind your achievements.</p>
          </div>
          <div className="feature-grid">
            {features.map(({ icon: Icon, title, copy }, index) => (
              <article
                className="feature-card"
                key={title}
                data-reveal
                style={{ "--stagger": index } as React.CSSProperties}
              >
                <span className="feature-icon"><Icon size={20} /></span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section shell steps-section">
        <div className="section-heading centered compact-heading" data-reveal>
          <span className="eyebrow">How it works</span>
          <h2>From file to professional gallery in three clear steps.</h2>
        </div>
        <div className="steps">
          {[
            ["01", "Add your certificates", "Upload a document or enter the details manually. Certlery keeps the file’s natural orientation."],
            ["02", "Add the useful context", "Attach the issuer, dates, credential ID, skills, collection, and official verification link."],
            ["03", "Share on your terms", "Feature the work that matters, choose visibility, and share a polished profile or direct link."],
          ].map(([number, title, copy], index) => (
            <article key={number} data-reveal style={{ "--stagger": index } as React.CSSProperties}>
              <span className="step-number">{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="section contact-section">
        <div className="shell contact-layout">
          <div className="contact-copy" data-reveal>
            <span className="eyebrow">Live Telegram contact</span>
            <h2>A direct line from this website to your bot.</h2>
            <p>
              Messages from this form are validated by the server and delivered through
              the Telegram Bot API. Bot tokens never reach the browser.
            </p>
            <div className="contact-points">
              <span><ShieldCheck size={17} /> Server-side bot credentials</span>
              <span><BellRing size={17} /> Immediate admin notification</span>
              <span><LockKeyhole size={17} /> Protected webhook commands</span>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      <section className="final-cta shell" data-reveal>
        <span className="cta-seal"><FileCheck2 size={30} /></span>
        <h2>Your work deserves more than a folder.</h2>
        <p>Give every course, award, and professional milestone a clear place in your story.</p>
        <Link href="/gallery" className="button button-primary button-glow" data-ripple data-magnetic>
          View the sample portfolio <ArrowRight size={17} />
        </Link>
      </section>

      <footer className="site-footer">
        <div className="footer-wave" aria-hidden="true">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,74 C240,4 480,124 720,62 C960,0 1200,112 1440,42 L1440,120 L0,120 Z" />
          </svg>
        </div>
        <div className="shell footer-grid">
          <div>
            <Brand compact />
            <p>Your achievements, beautifully preserved.</p>
          </div>
          <div className="footer-links">
            <a href="#gallery">Gallery</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#contact">Contact</a>
            <Link href="/admin/login">Admin</Link>
          </div>
          <a
            className="footer-social"
            href="https://github.com/Paim41"
            target="_blank"
            rel="noreferrer"
            aria-label="Paim41 on GitHub"
          >
            <Code2 size={18} />
            <span>github.com/Paim41</span>
          </a>
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
