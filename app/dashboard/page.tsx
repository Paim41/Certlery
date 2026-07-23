import type { Metadata } from "next";
import { isSupabaseConfigured, requireAppUser } from "../auth";
import { DashboardClient } from "../components/DashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Certificate workspace",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return <DashboardClient demo userName="Maya Chen" />;
  }

  const user = await requireAppUser("/dashboard");
  return <DashboardClient userName={user.fullName ?? user.displayName} />;
}
