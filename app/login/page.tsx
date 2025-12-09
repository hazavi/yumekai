import { Metadata } from "next";
import { LoginPage } from "./LoginPage";

export const metadata: Metadata = {
  title: "Sign In - YumeKai",
  description: "Sign in to YumeKai to track your anime and create lists",
};

export default function Page() {
  return <LoginPage />;
}
