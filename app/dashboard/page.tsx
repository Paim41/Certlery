import type { Metadata } from "next";
import { requireChatGPTUser } from "../chatgpt-auth";
import { DashboardClient } from "../components/DashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Certificate workspace",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const user = await requireChatGPTUser("/dashboard");
  return <DashboardClient userName={user.fullName ?? user.displayName} />;
}
