import { LandingPage } from "./components/LandingPage";
import { getAppUser, isSupabaseConfigured } from "./auth";

export default async function Home() {
  const user = await getAppUser();
  return (
    <LandingPage
      signedIn={Boolean(user)}
      authEnabled={isSupabaseConfigured()}
    />
  );
}
