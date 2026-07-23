import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "../../lib/admin-auth";
import { AdminToolbar } from "./AdminToolbar";
import { DashboardClient } from "../components/DashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin workspace",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <>
      <AdminToolbar />
      <DashboardClient localMode userName={session.username} />
    </>
  );
}
