import { Metadata } from "next";
import { UserSearchPage } from "./UserSearchPage";

export const metadata: Metadata = {
  title: "Find Users",
  description: "Search and discover other anime fans on Yumekai",
};

export default function Page() {
  return <UserSearchPage />;
}
