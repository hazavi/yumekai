import { Metadata } from "next";
import { SignupPage } from "./SignupPage";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a Yumekai account to track your anime and create lists",
};

export default function Page() {
  return <SignupPage />;
}
