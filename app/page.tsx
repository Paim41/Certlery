import { LandingPage } from "./components/LandingPage";
import { getChatGPTUser } from "./chatgpt-auth";

export default async function Home() {
  const user = await getChatGPTUser();
  return <LandingPage signedIn={Boolean(user)} />;
}
