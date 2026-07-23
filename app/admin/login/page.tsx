import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession, isAdminConfigured } from "../../../lib/admin-auth";
import { AdminLoginForm } from "./AdminLoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return <AdminLoginForm configured={isAdminConfigured()} />;
}

