import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import { isSupabaseConfigured } from "../lib/supabase/config";

export type AppUser = {
  id: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

export { isSupabaseConfigured };

export async function getAppUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null;

  return {
    id: user.id,
    email: user.email,
    fullName,
    displayName: fullName ?? user.email,
  };
}

export async function requireAppUser(returnTo: string): Promise<AppUser> {
  const user = await getAppUser();
  if (user) return user;
  redirect(`/signin?return_to=${encodeURIComponent(safeReturnTo(returnTo))}`);
}

function safeReturnTo(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}
