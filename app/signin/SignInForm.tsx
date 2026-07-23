"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import { createClient } from "../../lib/supabase/client";
import { Brand } from "../components/Brand";

export function SignInForm({
  returnTo,
  configured,
}: {
  returnTo: string;
  configured: boolean;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();
    if (!supabase) {
      setMessage("Authentication is not configured yet.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("fullName") ?? "").trim();
    setLoading(true);
    setMessage(null);

    const result =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName },
              emailRedirectTo: `${window.location.origin}/auth/callback?return_to=${encodeURIComponent(returnTo)}`,
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "signup") {
      setMessage("Check your email to verify your account, then return to sign in.");
    } else {
      window.location.assign(returnTo);
    }
  }

  async function continueWithGoogle() {
    const supabase = createClient();
    if (!supabase) {
      setMessage("Authentication is not configured yet.");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?return_to=${encodeURIComponent(returnTo)}`,
      },
    });
  }

  return (
    <main className="auth-page">
      <div className="auth-brand">
        <Link href="/" aria-label="Certlery home"><Brand /></Link>
      </div>
      <section className="auth-card">
        <div className="auth-seal"><ShieldCheck size={25} /></div>
        <span className="eyebrow">{mode === "signin" ? "Welcome back" : "Create your gallery"}</span>
        <h1>{mode === "signin" ? "Sign in to Certlery" : "Create your account"}</h1>
        <p>{mode === "signin" ? "Continue managing and sharing your professional credentials." : "Start preserving your certificates in one refined professional gallery."}</p>

        {!configured && (
          <div className="auth-notice">
            Account services are not configured on this deployment yet. You can still explore the interactive demo.
          </div>
        )}

        <button className="button button-secondary auth-google" onClick={continueWithGoogle} disabled={!configured}>
          <Mail size={17} /> Continue with Google
        </button>
        <div className="auth-divider"><span>or continue with email</span></div>

        <form onSubmit={submit}>
          {mode === "signup" && (
            <label>Full name<input name="fullName" autoComplete="name" required placeholder="Your full name" /></label>
          )}
          <label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
          <label>Password
            <span className="password-field">
              <input name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={8} required placeholder="At least 8 characters" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>
          {mode === "signin" && <div className="auth-options"><label><input type="checkbox" /> Remember me</label><button type="button">Forgot password?</button></div>}
          {message && <div className="auth-message" role="status">{message}</div>}
          <button className="button button-primary auth-submit" disabled={loading || !configured}>
            {loading && <LoaderCircle size={17} className="spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "signin" ? "New to Certlery?" : "Already have an account?"}
          <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(null); }}>
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
        {!configured && <Link href="/demo" className="button button-secondary auth-demo">Explore the dashboard demo</Link>}
      </section>
    </main>
  );
}
