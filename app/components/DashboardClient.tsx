"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  Archive,
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpDown,
  Bell,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Download,
  Eye,
  FileArchive,
  FileCheck2,
  FileJson,
  Filter,
  FolderKanban,
  Globe2,
  Grid2X2,
  Import,
  LayoutDashboard,
  Link2,
  List,
  Lock,
  Maximize2,
  Menu,
  Moon,
  MoreHorizontal,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Star,
  Sun,
  Trash2,
  UploadCloud,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { CertificateRecord } from "../lib/demo-certificates";
import { Brand } from "./Brand";
import { CertificateArtwork } from "./CertificateArtwork";

type WorkspacePage =
  | "overview"
  | "certificates"
  | "collections"
  | "featured"
  | "expiring"
  | "archived"
  | "public"
  | "import"
  | "settings";

const uploadSchema = z.object({
  title: z.string().min(2, "Enter a certificate title."),
  issuer: z.string().min(2, "Enter the issuing organization."),
  issueDate: z.string().min(1, "Choose an issue date."),
  expirationDate: z.string().optional(),
  credentialId: z.string().optional(),
  verificationUrl: z.union([z.literal(""), z.url("Enter a valid URL.")]),
  category: z.string().min(1),
  skills: z.string().optional(),
  orientation: z.enum(["portrait", "landscape", "square"]),
  visibility: z.enum(["public", "private", "unlisted"]),
  featured: z.boolean(),
  allowDownload: z.boolean(),
});

type UploadValues = z.infer<typeof uploadSchema>;

const navigation: { id: WorkspacePage; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "certificates", label: "My certificates", icon: FileCheck2 },
  { id: "collections", label: "Collections", icon: FolderKanban },
  { id: "featured", label: "Featured", icon: Star },
  { id: "expiring", label: "Expiring soon", icon: CalendarClock },
  { id: "archived", label: "Archived", icon: Archive },
  { id: "public", label: "Public gallery", icon: Globe2 },
  { id: "import", label: "Import and export", icon: Import },
  { id: "settings", label: "Settings", icon: Settings },
];

export function DashboardClient({
  userName = "Certlery Admin",
}: {
  userName?: string;
}) {
  const [page, setPage] = useState<WorkspacePage>("overview");
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "compact" | "list">("grid");
  const [filter, setFilter] = useState("all");
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewer, setViewer] = useState<CertificateRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/certificates")
      .then(async (response) => {
        const payload = (await response.json()) as {
          certificates?: CertificateRecord[];
          error?: string;
        };
        if (!response.ok) throw new Error(payload.error ?? "Unable to load certificates.");
        return payload;
      })
      .then(({ certificates: rows = [] }) => {
        if (!active) return;
        setCertificates(rows);
      })
      .catch((error: unknown) => {
        if (active) {
          notify(error instanceof Error ? error.message : "Your gallery could not be refreshed.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return certificates.filter((certificate) => {
      const matchesQuery =
        !term ||
        [certificate.title, certificate.issuer, certificate.category, ...certificate.skills]
          .join(" ")
          .toLowerCase()
          .includes(term);
      const matchesFilter =
        filter === "all" ||
        certificate.orientation === filter ||
        certificate.visibility === filter ||
        (filter === "verified" && certificate.verification === "verified") ||
        (filter === "featured" && certificate.featured);
      return matchesQuery && matchesFilter;
    });
  }, [certificates, filter, query]);

  function navigate(destination: WorkspacePage) {
    setPage(destination);
    setSidebarOpen(false);
  }

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }

  function toggleSelected(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <div className={`workspace ${dark ? "theme-dark" : ""}`}>
      <aside className={`sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="sidebar-head">
          <Link href="/" className="brand-link"><Brand /></Link>
          <button className="icon-button mobile-only" onClick={() => setSidebarOpen(false)} aria-label="Close navigation">
            <X size={20} />
          </button>
        </div>
        <button className="button button-primary sidebar-add" onClick={() => setUploadOpen(true)}>
          <Plus size={18} /> Add certificate
        </button>
        <nav className="sidebar-nav" aria-label="Workspace navigation">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button key={id} className={page === id ? "active" : ""} onClick={() => navigate(id)}>
              <Icon size={18} /><span>{label}</span>
              {id === "expiring" && <small>2</small>}
            </button>
          ))}
        </nav>
        <div className="storage-card">
          <div><span>Storage</span><strong>324 MB of 2 GB</strong></div>
          <div className="storage-track"><i /></div>
          <button>Manage storage</button>
        </div>
        <div className="sidebar-profile">
          <span className="avatar">MC</span>
          <span><strong>{userName}</strong><small>Personal gallery</small></span>
          <MoreHorizontal size={18} />
        </div>
      </aside>

      {sidebarOpen && <button className="sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}

      <div className="workspace-main">
        <header className="workspace-header">
          <button className="icon-button menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
            <Menu size={21} />
          </button>
          <label className="workspace-search">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search certificates, issuers, skills..." />
            <kbd>⌘ K</kbd>
          </label>
          <div className="workspace-actions">
            <button className="icon-button" onClick={() => setDark((value) => !value)} aria-label={dark ? "Use light theme" : "Use dark theme"}>
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button className="icon-button has-dot" aria-label="Notifications"><Bell size={19} /></button>
            <button className="button button-primary header-add" onClick={() => setUploadOpen(true)}><Plus size={17} /> Add certificate</button>
          </div>
        </header>

        <main className="workspace-content">
          {page === "overview" && (
            <Overview
              certificates={certificates}
              userName={userName}
              onAdd={() => setUploadOpen(true)}
              onView={setViewer}
              onNavigate={navigate}
            />
          )}
          {(page === "certificates" || page === "featured" || page === "archived") && (
            <CertificateLibrary
              certificates={page === "featured" ? filtered.filter((certificate) => certificate.featured) : filtered}
              query={query}
              setQuery={setQuery}
              filter={filter}
              setFilter={setFilter}
              view={view}
              setView={setView}
              selected={selected}
              toggleSelected={toggleSelected}
              onView={setViewer}
              onAdd={() => setUploadOpen(true)}
              onNotify={notify}
            />
          )}
          {page === "collections" && <Collections certificates={certificates} onNotify={notify} />}
          {page === "expiring" && <Expiring certificates={certificates} onView={setViewer} />}
          {page === "public" && <PublicSettings onNotify={notify} />}
          {page === "import" && <ImportExport onNotify={notify} />}
          {page === "settings" && <SettingsPanel dark={dark} setDark={setDark} onNotify={notify} />}
        </main>
      </div>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {navigation.slice(0, 4).map(({ id, label, icon: Icon }) => (
          <button key={id} className={page === id ? "active" : ""} onClick={() => navigate(id)}>
            <Icon size={19} /><span>{label === "My certificates" ? "Gallery" : label}</span>
          </button>
        ))}
        <button onClick={() => setSidebarOpen(true)}><Menu size={19} /><span>More</span></button>
      </nav>

      {uploadOpen && (
        <UploadDialog
          onClose={() => setUploadOpen(false)}
          onSaved={(certificate) => {
            setCertificates((current) => [certificate, ...current]);
            setUploadOpen(false);
            notify(
              certificate.visibility === "public"
                ? "Certificate published to the public gallery."
                : "Certificate saved successfully.",
            );
          }}
        />
      )}
      {viewer && <Viewer certificate={viewer} onClose={() => setViewer(null)} onNotify={notify} />}
      {toast && <div className="toast" role="status"><CheckCircle2 size={18} /> {toast}</div>}
    </div>
  );
}

function Overview({
  certificates,
  userName,
  onAdd,
  onView,
  onNavigate,
}: {
  certificates: CertificateRecord[];
  userName: string;
  onAdd(): void;
  onView(certificate: CertificateRecord): void;
  onNavigate(page: WorkspacePage): void;
}) {
  const firstName = userName.split(" ")[0] || userName;
  const publicCount = certificates.filter((certificate) => certificate.visibility === "public").length;
  const featured = certificates.filter((certificate) => certificate.featured).slice(0, 3);
  return (
    <>
      <div className="workspace-title">
        <div><span className="eyebrow">Certificate workspace</span><h1>Good afternoon, {firstName}.</h1><p>Your collection is organized and ready to share.</p></div>
        <button className="button button-primary" onClick={onAdd}><Plus size={17} /> Add certificate</button>
      </div>
      <div className="stat-row">
        <article><span className="stat-icon"><FileCheck2 size={19} /></span><div><small>Total certificates</small><strong>{certificates.length}</strong><button onClick={() => onNavigate("certificates")}>View all</button></div></article>
        <article><span className="stat-icon"><Globe2 size={19} /></span><div><small>Public certificates</small><strong>{publicCount}</strong><button onClick={() => onNavigate("public")}>Manage gallery</button></div></article>
        <article><span className="stat-icon warning"><CalendarClock size={19} /></span><div><small>Expiring soon</small><strong>2</strong><button onClick={() => onNavigate("expiring")}>Review dates</button></div></article>
        <article><span className="stat-icon"><Star size={19} /></span><div><small>Featured</small><strong>{certificates.filter((c) => c.featured).length}</strong><button onClick={() => onNavigate("featured")}>Edit selection</button></div></article>
      </div>
      <div className="dashboard-columns">
        <section className="panel">
          <div className="panel-head"><div><h2>Featured certificates</h2><p>Your strongest credentials, ready to share.</p></div><button onClick={() => onNavigate("featured")}>View all <ArrowLeft className="arrow-right" size={15} /></button></div>
          <div className="featured-row">
            {featured.map((certificate) => (
              <button className="featured-mini" key={certificate.id} onClick={() => onView(certificate)}>
                <CertificateArtwork certificate={certificate} compact />
                <span><strong>{certificate.title}</strong><small>{certificate.issuer}</small></span>
              </button>
            ))}
          </div>
        </section>
        <aside className="panel activity-panel">
          <div className="panel-head"><div><h2>Recent activity</h2><p>Changes in your gallery.</p></div></div>
          <ul className="activity-list">
            <li><span><UploadCloud size={15} /></span><div><strong>Certificate added</strong><p>Google UX Design</p><small>2 hours ago</small></div></li>
            <li><span><Globe2 size={15} /></span><div><strong>Gallery updated</strong><p>3 featured credentials</p><small>Yesterday</small></div></li>
            <li><span><ShieldCheck size={15} /></span><div><strong>Link confirmed</strong><p>Responsive Web Design</p><small>2 days ago</small></div></li>
          </ul>
        </aside>
      </div>
      <section className="panel renewal-panel">
        <span className="renewal-icon"><CalendarClock size={22} /></span>
        <div><h2>Two credentials need attention</h2><p>Data Analytics Workshop expires in 38 days. Cybersecurity Fundamentals follows in 61 days.</p></div>
        <button className="button button-secondary" onClick={() => onNavigate("expiring")}>Review expiration dates</button>
      </section>
    </>
  );
}

function CertificateLibrary({
  certificates,
  query,
  setQuery,
  filter,
  setFilter,
  view,
  setView,
  selected,
  toggleSelected,
  onView,
  onAdd,
  onNotify,
}: {
  certificates: CertificateRecord[];
  query: string;
  setQuery(value: string): void;
  filter: string;
  setFilter(value: string): void;
  view: "grid" | "compact" | "list";
  setView(value: "grid" | "compact" | "list"): void;
  selected: string[];
  toggleSelected(id: string): void;
  onView(certificate: CertificateRecord): void;
  onAdd(): void;
  onNotify(message: string): void;
}) {
  return (
    <>
      <div className="workspace-title library-title">
        <div><span className="eyebrow">My certificates</span><h1>Certificate gallery</h1><p>{certificates.length} credentials across your professional story.</p></div>
        <button className="button button-primary" onClick={onAdd}><Plus size={17} /> Add certificate</button>
      </div>
      <div className="library-toolbar">
        <label className="toolbar-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search gallery" /></label>
        <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter certificates">
          <option value="all">All certificates</option>
          <option value="landscape">Landscape</option>
          <option value="portrait">Portrait</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="verified">Verified</option>
          <option value="featured">Featured</option>
        </select>
        <button className="toolbar-button"><ArrowUpDown size={16} /> Recently added <ChevronDown size={14} /></button>
        <div className="view-switcher" aria-label="Gallery view">
          <button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} aria-label="Grid view"><Grid2X2 size={17} /></button>
          <button className={view === "compact" ? "active" : ""} onClick={() => setView("compact")} aria-label="Compact grid"><Filter size={17} /></button>
          <button className={view === "list" ? "active" : ""} onClick={() => setView("list")} aria-label="List view"><List size={18} /></button>
        </div>
      </div>
      {filter !== "all" && <div className="filter-chips"><span>{filter}<button onClick={() => setFilter("all")} aria-label={`Remove ${filter} filter`}><X size={13} /></button></span><button onClick={() => setFilter("all")}>Clear all</button></div>}
      {selected.length > 0 && <div className="bulk-bar"><span>{selected.length} selected</span><button onClick={() => onNotify("Selected certificates added to a collection.")}><FolderKanban size={16} /> Add to collection</button><button onClick={() => onNotify("Selected certificates archived. Undo is available for 30 seconds.")}><Archive size={16} /> Archive</button><button className="danger"><Trash2 size={16} /> Delete</button></div>}
      {certificates.length ? (
        <div className={`certificate-grid view-${view}`}>
          {certificates.map((certificate) => (
            <article className="certificate-card" key={certificate.id}>
              <div className="card-preview">
                <label className="select-check" aria-label={`Select ${certificate.title}`}>
                  <input type="checkbox" checked={selected.includes(certificate.id)} onChange={() => toggleSelected(certificate.id)} />
                  <span><Check size={12} /></span>
                </label>
                {certificate.featured && <span className="featured-flag"><Star size={13} fill="currentColor" /> Featured</span>}
                <button className="preview-button" onClick={() => onView(certificate)} aria-label={`View ${certificate.title}`}>
                  <CertificateArtwork certificate={certificate} compact={view === "compact"} />
                </button>
              </div>
              <div className="card-body">
                <div className="card-title-row">
                  <div><h3>{certificate.title}</h3><p>{certificate.issuer}</p></div>
                  <button className="icon-button subtle" aria-label={`Actions for ${certificate.title}`}><MoreHorizontal size={18} /></button>
                </div>
                <div className="card-meta">
                  <span>{new Date(certificate.issueDate).toLocaleDateString("en", { month: "short", year: "numeric" })}</span>
                  <i />
                  <span>{certificate.category}</span>
                  <i />
                  <span>{certificate.orientation}</span>
                </div>
                <div className="card-status">
                  <StatusBadge certificate={certificate} />
                  <VisibilityBadge visibility={certificate.visibility} />
                </div>
                <div className="list-only list-actions">
                  <button onClick={() => onView(certificate)}><Eye size={16} /> View</button>
                  <button onClick={() => onNotify("Share link copied.")}><Share2 size={16} /> Share</button>
                  <button><Download size={16} /> Download</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state"><Search size={28} /><h2>No certificates match the selected filters.</h2><p>Try removing a filter or changing the search phrase.</p><button className="button button-secondary" onClick={() => { setQuery(""); setFilter("all"); }}>Clear search</button></div>
      )}
    </>
  );
}

function Collections({ certificates, onNotify }: { certificates: CertificateRecord[]; onNotify(message: string): void }) {
  const groups = Array.from(new Set(certificates.map((certificate) => certificate.collection).filter(Boolean))) as string[];
  return (
    <>
      <div className="workspace-title"><div><span className="eyebrow">Collections</span><h1>Organize by chapter.</h1><p>Curate credentials for roles, disciplines, and milestones.</p></div><button className="button button-primary" onClick={() => onNotify("New collection ready to name.")}><Plus size={17} /> New collection</button></div>
      <div className="collection-grid">
        {groups.map((group, index) => {
          const items = certificates.filter((certificate) => certificate.collection === group);
          return (
            <article className="collection-card" key={group}>
              <div className="collection-cover">
                {items.slice(0, 3).map((certificate) => <CertificateArtwork key={certificate.id} certificate={certificate} compact />)}
              </div>
              <div><span className="collection-number">0{index + 1}</span><h2>{group}</h2><p>{items.length} certificate{items.length === 1 ? "" : "s"}</p><div><span><Lock size={13} /> Private</span><small>Updated this month</small></div></div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function Expiring({ certificates, onView }: { certificates: CertificateRecord[]; onView(certificate: CertificateRecord): void }) {
  const expiring = certificates.filter((certificate) => certificate.expirationDate);
  return (
    <>
      <div className="workspace-title"><div><span className="eyebrow">Expiration tracking</span><h1>Renew with time to spare.</h1><p>Keep important credentials active and visible.</p></div></div>
      <div className="panel expiry-table">
        <div className="table-head"><span>Certificate</span><span>Expiration date</span><span>Remaining</span><span>Reminder</span><span /></div>
        {expiring.map((certificate, index) => (
          <div className="table-row" key={certificate.id}>
            <div><span className="table-thumb"><CertificateArtwork certificate={certificate} compact /></span><span><strong>{certificate.title}</strong><small>{certificate.issuer}</small></span></div>
            <span>{new Date(certificate.expirationDate!).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}</span>
            <span className={`days-badge ${index === 0 ? "urgent" : ""}`}>{index === 0 ? "38 days" : "61 days"}</span>
            <span><Bell size={15} /> 30 days before</span>
            <button onClick={() => onView(certificate)}>View</button>
          </div>
        ))}
      </div>
    </>
  );
}

function PublicSettings({ onNotify }: { onNotify(message: string): void }) {
  return (
    <>
      <div className="workspace-title"><div><span className="eyebrow">Public gallery</span><h1>Shape your public profile.</h1><p>Choose what people see when you share your Certlery link.</p></div><Link href="/gallery" className="button button-secondary"><Eye size={17} /> Preview gallery</Link></div>
      <div className="settings-layout">
        <section className="panel settings-card"><h2>Profile details</h2><p>Introduce your work before visitors reach the certificates.</p><div className="form-grid"><label>Gallery title<input defaultValue="Certlery Showcase" /></label><label>Professional headline<input defaultValue="A sample credential portfolio" /></label><label className="full-field">Biography<textarea defaultValue="A public portfolio for professional certificates, academic awards, skills, and verification details." /></label><label>Public username<div className="input-prefix"><span>certlery.app/</span><input defaultValue="gallery" /></div></label><label>Default layout<select defaultValue="standard"><option value="standard">Standard grid</option><option value="compact">Compact gallery</option><option value="editorial">Editorial list</option></select></label></div></section>
        <aside className="panel settings-card"><h2>Profile visibility</h2><p>Control discovery and downloads.</p><Toggle label="Public profile" copy="Anyone with the link can view your gallery." checked /><Toggle label="Search engine indexing" copy="Allow your profile to appear in search results." checked /><Toggle label="Show certificate count" copy="Display the total on your profile." checked /><Toggle label="Allow downloads" copy="Use each certificate’s download preference." /><button className="button button-primary full-button" onClick={() => onNotify("Public gallery settings saved.")}>Save public settings</button></aside>
      </div>
    </>
  );
}

function ImportExport({ onNotify }: { onNotify(message: string): void }) {
  const cards = [
    { icon: Import, title: "Import from CSV", copy: "Map columns, detect duplicates, and preview records before import.", action: "Choose CSV file" },
    { icon: ArrowDownToLine, title: "Export metadata", copy: "Download your complete certificate index as a clean CSV file.", action: "Export CSV" },
    { icon: FileJson, title: "Back up all data", copy: "Create a portable JSON backup of profiles, collections, and metadata.", action: "Download JSON" },
    { icon: FileArchive, title: "Download certificate files", copy: "Prepare your selected original files as a single archive.", action: "Create archive" },
  ];
  return (
    <>
      <div className="workspace-title"><div><span className="eyebrow">Import and export</span><h1>Your data stays portable.</h1><p>Bring records in, keep a backup, or take your entire collection with you.</p></div></div>
      <div className="transfer-grid">
        {cards.map(({ icon: Icon, title, copy, action }) => <article className="panel transfer-card" key={title}><span><Icon size={22} /></span><h2>{title}</h2><p>{copy}</p><button className="button button-secondary" onClick={() => onNotify(`${action} is ready.`)}>{action}</button></article>)}
      </div>
    </>
  );
}

function SettingsPanel({ dark, setDark, onNotify }: { dark: boolean; setDark(value: boolean): void; onNotify(message: string): void }) {
  return (
    <>
      <div className="workspace-title"><div><span className="eyebrow">Settings</span><h1>Make Certlery yours.</h1><p>Manage appearance, reminders, privacy, and account security.</p></div></div>
      <div className="settings-layout">
        <section className="panel settings-card"><h2>Appearance</h2><p>Choose how your private workspace looks.</p><div className="theme-options"><button className={!dark ? "active" : ""} onClick={() => setDark(false)}><span className="theme-swatch light"><Sun size={18} /></span><strong>Light</strong><small>Warm ivory workspace</small></button><button className={dark ? "active" : ""} onClick={() => setDark(true)}><span className="theme-swatch dark"><Moon size={18} /></span><strong>Dark</strong><small>Soft charcoal workspace</small></button></div></section>
        <aside className="panel settings-card"><h2>Notifications</h2><p>Decide what deserves your attention.</p><Toggle label="Expiration reminders" copy="Receive alerts before credentials expire." checked /><Toggle label="Account security" copy="Important sign-in and account updates." checked /><Toggle label="Certificate activity" copy="Changes to shared links and gallery content." /><button className="button button-primary full-button" onClick={() => onNotify("Notification preferences saved.")}>Save preferences</button></aside>
      </div>
    </>
  );
}

function UploadDialog({ onClose, onSaved }: { onClose(): void; onSaved(certificate: CertificateRecord): void }) {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { register, handleSubmit, control, trigger, formState: { errors } } = useForm<UploadValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { issueDate: new Date().toISOString().slice(0, 10), orientation: "landscape", visibility: "private", featured: false, allowDownload: true, category: "Professional", verificationUrl: "" },
  });
  const values = useWatch({ control }) as UploadValues;
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : undefined),
    [file],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function chooseFile(candidate: File | null) {
    setSubmitError(null);
    if (!candidate) {
      setFile(null);
      return;
    }
    if (candidate.size > 10 * 1024 * 1024) {
      setFile(null);
      setSubmitError("Choose a file no larger than 10 MB.");
      return;
    }
    if (!["application/pdf", "image/png", "image/jpeg", "image/webp"].includes(candidate.type)) {
      setFile(null);
      setSubmitError("Use a PDF, PNG, JPG, JPEG, or WebP certificate.");
      return;
    }
    setFile(candidate);
  }

  async function continueToNextStep() {
    setSubmitError(null);
    if (step === 1 && !file) {
      setSubmitError("Choose the certificate file before continuing.");
      return;
    }
    if (step === 2) {
      const valid = await trigger(["title", "issuer", "issueDate", "verificationUrl", "category"]);
      if (!valid) return;
    }
    setStep((current) => Math.min(4, current + 1));
  }

  async function save(data: UploadValues) {
    if (!file) {
      setStep(1);
      setSubmitError("Choose the certificate file before publishing.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const form = new FormData();
      form.append("metadata", JSON.stringify(data));
      form.append("file", file);
      const response = await fetch("/api/certificates", { method: "POST", body: form });
      const payload = (await response.json()) as {
        certificate?: CertificateRecord;
        error?: string;
      };
      if (!response.ok || !payload.certificate) {
        throw new Error(payload.error ?? "The certificate could not be saved.");
      }
      onSaved(payload.certificate);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "The certificate could not be saved.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="upload-dialog" role="dialog" aria-modal="true" aria-labelledby="upload-title">
        <header><div><span className="eyebrow">Add certificate</span><h2 id="upload-title">{["Upload your file", "Certificate details", "Display settings", "Review and publish"][step - 1]}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close add certificate"><X size={20} /></button></header>
        <div className="stepper" aria-label="Progress">{[1, 2, 3, 4].map((number) => <span key={number} className={step >= number ? "active" : ""}><i>{step > number ? <Check size={12} /> : number}</i><small>{["Upload", "Details", "Display", "Review"][number - 1]}</small></span>)}</div>
        <form onSubmit={handleSubmit(save)}>
          <div className="upload-content">
            {step === 1 && (
              <>
                <label className="dropzone">
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={(event) => chooseFile(event.target.files?.[0] ?? null)} />
                  <span className="dropzone-icon"><UploadCloud size={27} /></span>
                  <strong>{file ? file.name : "Drop your certificate here"}</strong>
                  <p>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · Ready to upload` : "or browse files from your device"}</p>
                  <small>PDF, PNG, JPG, JPEG, or WebP · Maximum 10 MB</small>
                  <span className="button button-secondary">{file ? "Replace file" : "Browse files"}</span>
                </label>
                <div className="upload-note"><ShieldCheck size={18} /><span><strong>Private by default</strong><small>Your certificate will not be public until you choose its visibility.</small></span></div>
              </>
            )}
            {step === 2 && (
              <div className="form-grid">
                <label>Certificate title<input {...register("title")} placeholder="e.g. Google UX Design" />{errors.title && <em>{errors.title.message}</em>}</label>
                <label>Issuing organization<input {...register("issuer")} placeholder="e.g. Google" />{errors.issuer && <em>{errors.issuer.message}</em>}</label>
                <label>Issue date<input type="date" {...register("issueDate")} />{errors.issueDate && <em>{errors.issueDate.message}</em>}</label>
                <label>Expiration date <small>Optional</small><input type="date" {...register("expirationDate")} /></label>
                <label>Credential ID <small>Optional</small><input {...register("credentialId")} placeholder="ABC-1234" /></label>
                <label>Category<select {...register("category")}><option>Professional</option><option>Academic</option><option>Design</option><option>Development</option><option>Data</option><option>Cybersecurity</option></select></label>
                <label className="full-field">Verification URL <small>Optional</small><input {...register("verificationUrl")} placeholder="https://issuer.example/verify" />{errors.verificationUrl && <em>{errors.verificationUrl.message}</em>}</label>
                <label className="full-field">Skills <small>Comma separated</small><input {...register("skills")} placeholder="User research, Prototyping, Figma" /></label>
              </div>
            )}
            {step === 3 && (
              <div className="display-options">
                <fieldset><legend>Orientation</legend><div className="choice-cards">{(["landscape", "portrait", "square"] as const).map((orientation) => <label key={orientation}><input type="radio" value={orientation} {...register("orientation")} /><span className={`ratio-icon ${orientation}`} /><strong>{orientation[0].toUpperCase() + orientation.slice(1)}</strong><small>{orientation === "landscape" ? "Best for wide certificates" : orientation === "portrait" ? "Best for vertical awards" : "For badges and custom files"}</small></label>)}</div></fieldset>
                <fieldset><legend>Visibility</legend><div className="choice-cards">{(["private", "public", "unlisted"] as const).map((visibility) => <label key={visibility}><input type="radio" value={visibility} {...register("visibility")} />{visibility === "private" ? <Lock size={20} /> : visibility === "public" ? <Globe2 size={20} /> : <Link2 size={20} />}<strong>{visibility[0].toUpperCase() + visibility.slice(1)}</strong><small>{visibility === "private" ? "Only you can access it" : visibility === "public" ? "Visible in your gallery" : "Anyone with the link"}</small></label>)}</div></fieldset>
                <ToggleInput register={register} name="featured" label="Feature this certificate" copy="Place it near the top of your public gallery." />
                <ToggleInput register={register} name="allowDownload" label="Allow downloads" copy="Let permitted viewers download the original file." />
              </div>
            )}
            {step === 4 && (
              <div className="review-layout">
                <CertificateArtwork certificate={{ id: "preview", title: values.title || "Certificate title", issuer: values.issuer || "Issuing organization", issueDate: values.issueDate, expirationDate: values.expirationDate, credentialId: values.credentialId, category: values.category, skills: values.skills?.split(",") ?? [], orientation: values.orientation, fileType: file?.type === "application/pdf" ? "pdf" : "image", visibility: values.visibility, verification: values.verificationUrl ? "link" : "unavailable", featured: values.featured, description: "", tone: "gold", fileUrl: previewUrl, fileName: file?.name, mimeType: file?.type, allowDownload: values.allowDownload }} />
                <div><h3>{values.title || "Untitled certificate"}</h3><p>{values.issuer || "No issuer entered"}</p><dl><div><dt>Issue date</dt><dd>{values.issueDate || "Not set"}</dd></div><div><dt>Category</dt><dd>{values.category}</dd></div><div><dt>Orientation</dt><dd>{values.orientation}</dd></div><div><dt>Visibility</dt><dd>{values.visibility}</dd></div><div><dt>File</dt><dd>{file?.name ?? "Metadata only"}</dd></div></dl><div className="review-warning"><CircleAlert size={17} /> Confirm that the title and issuing organization match the original certificate.</div></div>
              </div>
            )}
          </div>
          {submitError && <div className="upload-error" role="alert"><CircleAlert size={16} /> {submitError}</div>}
          <footer><button type="button" className="text-button" onClick={onClose}>Cancel</button><div>{step > 1 && <button type="button" className="button button-secondary" onClick={() => { setSubmitError(null); setStep((current) => current - 1); }}>Back</button>}{step < 4 ? <button type="button" className="button button-primary" onClick={continueToNextStep}>Continue</button> : <button type="submit" className="button button-primary" disabled={submitting}>{submitting ? "Publishing..." : values.visibility === "public" ? "Publish certificate" : "Save certificate"}</button>}</div></footer>
        </form>
      </div>
    </div>
  );
}

function Viewer({ certificate, onClose, onNotify }: { certificate: CertificateRecord; onClose(): void; onNotify(message: string): void }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  return (
    <div className="viewer" role="dialog" aria-modal="true" aria-label={`Viewing ${certificate.title}`}>
      <header><button className="icon-button viewer-close" onClick={onClose} aria-label="Close viewer"><X size={20} /></button><div><strong>{certificate.title}</strong><small>{certificate.issuer}</small></div><div className="viewer-actions"><button onClick={() => onNotify("Share link copied.")}><Share2 size={17} /><span>Share</span></button><button><Download size={17} /><span>Download</span></button><button onClick={() => window.print()}><Printer size={17} /><span>Print</span></button></div></header>
      <div className="viewer-body">
        <div className="viewer-stage">
          <div className="viewer-document" style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}><CertificateArtwork certificate={certificate} /></div>
          <div className="viewer-controls"><button onClick={() => setZoom((value) => Math.max(.6, value - .1))} aria-label="Zoom out"><ZoomOut size={17} /></button><span>{Math.round(zoom * 100)}%</span><button onClick={() => setZoom((value) => Math.min(1.6, value + .1))} aria-label="Zoom in"><ZoomIn size={17} /></button><i /><button onClick={() => setRotation((value) => value - 90)} aria-label="Rotate left"><RotateCcw size={17} /></button><button onClick={() => { setZoom(1); setRotation(0); }} aria-label="Fit to screen"><Maximize2 size={17} /></button></div>
        </div>
        <aside className="viewer-info"><span className="eyebrow">Certificate details</span><h2>{certificate.title}</h2><p className="viewer-issuer">{certificate.issuer}</p><div className="viewer-badges"><StatusBadge certificate={certificate} /><VisibilityBadge visibility={certificate.visibility} /></div><dl><div><dt>Issue date</dt><dd>{new Date(certificate.issueDate).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}</dd></div>{certificate.expirationDate && <div><dt>Expiration date</dt><dd>{new Date(certificate.expirationDate).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}</dd></div>}<div><dt>Credential ID</dt><dd>{certificate.credentialId ?? "Not provided"}</dd></div><div><dt>Category</dt><dd>{certificate.category}</dd></div><div><dt>Collection</dt><dd>{certificate.collection ?? "None"}</dd></div></dl><div className="skill-list">{certificate.skills.map((skill) => <span key={skill}>{skill}</span>)}</div><p className="viewer-description">{certificate.description}</p>{certificate.verification !== "unavailable" && <button className="button button-secondary full-button"><Link2 size={16} /> Open verification link</button>}<p className="verification-note"><ShieldCheck size={15} /> Verification link provided by the certificate owner.</p></aside>
      </div>
    </div>
  );
}

function StatusBadge({ certificate }: { certificate: CertificateRecord }) {
  if (certificate.expirationDate) return <span className="status-badge warning"><CalendarClock size={13} /> Expiring soon</span>;
  if (certificate.verification === "verified") return <span className="status-badge success"><ShieldCheck size={13} /> Link confirmed</span>;
  if (certificate.verification === "link") return <span className="status-badge"><Link2 size={13} /> Verification link</span>;
  return <span className="status-badge muted"><CircleAlert size={13} /> Unavailable</span>;
}

function VisibilityBadge({ visibility }: { visibility: CertificateRecord["visibility"] }) {
  return <span className="visibility-badge">{visibility === "public" ? <Globe2 size={13} /> : visibility === "private" ? <Lock size={13} /> : <Link2 size={13} />}{visibility}</span>;
}

function Toggle({ label, copy, checked = false }: { label: string; copy: string; checked?: boolean }) {
  return <label className="toggle-row"><span><strong>{label}</strong><small>{copy}</small></span><input type="checkbox" defaultChecked={checked} /><i /></label>;
}

function ToggleInput({ register, name, label, copy }: { register: ReturnType<typeof useForm<UploadValues>>["register"]; name: "featured" | "allowDownload"; label: string; copy: string }) {
  return <label className="toggle-row"><span><strong>{label}</strong><small>{copy}</small></span><input type="checkbox" {...register(name)} /><i /></label>;
}
