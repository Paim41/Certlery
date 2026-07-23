import type { Metadata } from "next";
import { isSupabaseConfigured } from "../auth";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string }>;
}) {
  const params = await searchParams;
  const returnTo =
    params.return_to?.startsWith("/") && !params.return_to.startsWith("//")
      ? params.return_to
      : "/dashboard";

  return <SignInForm returnTo={returnTo} configured={isSupabaseConfigured()} />;
}
