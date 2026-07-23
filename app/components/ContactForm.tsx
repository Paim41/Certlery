"use client";

import { useState } from "react";
import { Check, LoaderCircle, Send } from "lucide-react";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const response = await fetch("/api/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        message: data.get("message"),
        website: data.get("website"),
      }),
    });
    const result = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setState("error");
      setMessage(result.error ?? "The message could not be delivered.");
      return;
    }
    form.reset();
    setState("success");
    setMessage("Your message was delivered to Telegram.");
  }

  return (
    <form className={`contact-form ${state === "success" ? "is-success" : ""}`} onSubmit={submit} data-reveal>
      <input type="hidden" name="website" value="" />
      <label className="floating-field">
        <input name="name" required minLength={2} maxLength={100} placeholder=" " />
        <span>Your name</span>
      </label>
      <label className="floating-field">
        <input name="email" type="email" required maxLength={180} placeholder=" " />
        <span>Email address</span>
      </label>
      <label className="floating-field contact-message">
        <textarea name="message" required minLength={10} maxLength={1800} placeholder=" " />
        <span>How can Certlery help?</span>
      </label>
      {message && <p className={`form-status ${state}`} role="status">{state === "success" && <Check size={16} />}{message}</p>}
      <button
        className="button button-primary"
        disabled={state === "loading"}
        data-ripple
        data-magnetic
      >
        {state === "loading" ? <LoaderCircle size={17} className="spin" /> : state === "success" ? <Check size={17} /> : <Send size={17} />}
        {state === "loading" ? "Sending" : state === "success" ? "Message sent" : "Send to Telegram"}
      </button>
    </form>
  );
}
