"use client";

import { useEffect, useState } from "react";
import { Bot, CheckCircle2, LoaderCircle, LogOut, Radio } from "lucide-react";

export function AdminToolbar() {
  const [configured, setConfigured] = useState(false);
  const [working, setWorking] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/telegram")
      .then((response) => response.json())
      .then((status: { configured?: boolean }) => setConfigured(Boolean(status.configured)))
      .catch(() => undefined);
  }, []);

  async function telegramAction(action: "test" | "configure-webhook") {
    setWorking(action);
    setNotice(null);
    const response = await fetch("/api/admin/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const result = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };
    setWorking(null);
    setNotice(response.ok ? result.message ?? "Done." : result.error ?? "Telegram action failed.");
  }

  async function logout() {
    setWorking("logout");
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/admin/login");
  }

  return (
    <div className="admin-toolbar">
      <span className={`live-indicator ${configured ? "is-online" : ""}`}>
        <i /> <Bot size={15} /> Telegram {configured ? "connected" : "awaiting env"}
      </span>
      {notice && <span className="admin-toolbar-notice"><CheckCircle2 size={14} /> {notice}</span>}
      <div>
        <button onClick={() => telegramAction("test")} disabled={!configured || Boolean(working)}>
          {working === "test" ? <LoaderCircle size={15} className="spin" /> : <Radio size={15} />} Test bot
        </button>
        <button onClick={() => telegramAction("configure-webhook")} disabled={!configured || Boolean(working)}>
          Connect webhook
        </button>
        <button onClick={logout} disabled={Boolean(working)}>
          {working === "logout" ? <LoaderCircle size={15} className="spin" /> : <LogOut size={15} />} Sign out
        </button>
      </div>
    </div>
  );
}

