import { Metadata } from "next";
import { UserSearchPage } from "./UserSearchPage";

export const metadata: Metadata = {
  title: "Find Users - YumeKai",
  description: "Search and discover other anime fans on YumeKai",
};

export default function Page() {
  return <UserSearchPage />;
}
