import { redirect } from "next/navigation";

export default function RemovedSignInPage() {
  redirect("/admin/login");
}
