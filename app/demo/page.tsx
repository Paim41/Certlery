import { redirect } from "next/navigation";

export default function RemovedDemoPage() {
  redirect("/admin/login");
}
