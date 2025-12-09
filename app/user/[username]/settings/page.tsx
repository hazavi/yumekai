import { SettingsPage } from "./SettingsPage";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function Page({ params }: PageProps) {
  const { username } = await params;
  return <SettingsPage username={username} />;
}
