import type { Metadata } from "next";
import { DashboardClient } from "../components/DashboardClient";

export const metadata: Metadata = {
  title: "Interactive dashboard demo",
  description: "Explore the Certlery certificate management workspace.",
};

export default function DemoPage() {
  return <DashboardClient demo />;
}
