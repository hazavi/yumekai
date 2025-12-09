import { Metadata } from "next";
import { EditRankingsPage } from "./EditRankingsPage";

export const metadata: Metadata = {
  title: "Edit Top 10 Rankings - YumeKai",
  description: "Edit your top 10 anime rankings",
};

export default function Page() {
  return <EditRankingsPage />;
}
