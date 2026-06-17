import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopNav } from "@/components/layout/TopNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("approved")
    .eq("id", user.id)
    .single();

  if (!profile?.approved) redirect("/pending");

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav email={user.email ?? ""} />
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {children}
      </main>
    </div>
  );
}
