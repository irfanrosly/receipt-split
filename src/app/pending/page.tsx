import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PendingSignOut } from "@/components/auth/PendingSignOut";

export default async function PendingPage() {
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

  if (profile?.approved) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-4">
        <h1 className="font-heading text-xl font-bold text-primary">
          <span aria-hidden="true">✂️ </span>Awaiting approval
        </h1>
        <p className="text-sm text-muted-foreground">
          Your account ({user.email}) is pending approval. You&apos;ll get access
          once an admin approves it.
        </p>
        <PendingSignOut />
      </div>
    </div>
  );
}
