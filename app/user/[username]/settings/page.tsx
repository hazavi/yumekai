import { Metadata } from "next";
import { SettingsPage } from "./SettingsPage";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your Yumekai account settings",
};

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function Page({ params }: PageProps) {
  const { username } = await params;
  return <SettingsPage username={username} />;
}
