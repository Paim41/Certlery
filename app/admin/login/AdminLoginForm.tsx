"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import { Brand } from "../../components/Brand";

export function AdminLoginForm({ configured }: { configured: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: String(form.get("username") ?? ""),
        password: String(form.get("password") ?? ""),
      }),
    });
    const result = (await response.json().catch(() => ({}))) as { error?: string };
    setLoading(false);
    if (!response.ok) {
      setMessage(result.error ?? "Sign-in failed.");
      return;
    }
    setSuccess(true);
    window.setTimeout(() => window.location.assign("/admin"), 650);
  }

  return (
    <main className="auth-page admin-auth-page">
      <div className="auth-aurora" aria-hidden="true" />
      <div className="auth-brand">
        <Link href="/" aria-label="Certlery home"><Brand /></Link>
      </div>
      <section className="auth-card admin-auth-card" data-reveal>
        <div className={`auth-seal ${success ? "is-success" : ""}`}>
          {success ? <Check size={25} /> : <LockKeyhole size={25} />}
        </div>
        <span className="eyebrow">Private administration</span>
        <h1>{success ? "Access granted" : "Admin sign in"}</h1>
        <p>Use the credentials stored securely in this deployment&apos;s environment.</p>

        {!configured && (
          <div className="auth-notice">
            Admin environment variables have not been configured yet.
          </div>
        )}

        <form onSubmit={submit}>
          <label className="floating-field">
            <UserRound size={17} />
            <input name="username" autoComplete="username" required placeholder=" " />
            <span>Admin username</span>
          </label>
          <label className="floating-field">
            <LockKeyhole size={17} />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder=" "
            />
            <span>Password</span>
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </label>
          {message && <div className="auth-message" role="status">{message}</div>}
          <button
            className={`button button-primary auth-submit ${success ? "button-success" : ""}`}
            disabled={loading || success || !configured}
            data-ripple
          >
            {loading && <LoaderCircle size={17} className="spin" />}
            {success && <Check size={17} />}
            {success ? "Opening workspace" : loading ? "Signing in" : "Sign in securely"}
          </button>
        </form>
        <Link href="/" className="auth-back">Return to Certlery</Link>
      </section>
    </main>
  );
}

