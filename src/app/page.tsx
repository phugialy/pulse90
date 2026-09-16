import type { Metadata } from "next";
import { ClosingExperience } from "@/components/closing-experience";

export const metadata: Metadata = {
  title: "Final Whistle | Pulse90",
  description:
    "Pulse90 is retiring its live World Cup watch desk. The craft behind it is still available through Phugialy.",
};

export default function Home() {
  return <ClosingExperience />;
}
