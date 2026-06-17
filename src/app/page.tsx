import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Landing } from "@/components/landing/Landing";

export const metadata: Metadata = {
  title: "SplitLah — split bills the easy way",
  description:
    "Snap a receipt, we kira the split, and share a card showing what everyone owes — with DuitNow QR to pay you back. Free, no install. Tak payah pening.",
};

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <Landing />;
}
