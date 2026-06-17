import { notFound, redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { calculateSplit } from "@/lib/split/calculator";
import { loadSessionForSplit } from "@/lib/sessions/saveSessionFromWizard";
import { SummaryHeader } from "@/components/session/summary/SummaryHeader";
import { PersonCard } from "@/components/session/summary/PersonCard";
import { ExportAll } from "@/components/session/summary/ExportAll";
import { PaymentDetails } from "@/components/session/summary/PaymentDetails";

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function SessionPage({ params }: Props) {
  const { sessionId } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const data = await loadSessionForSplit(supabase, sessionId, user.id);
  if (!data) notFound();

  const splits = calculateSplit(
    data.items,
    data.participants,
    data.charges,
    data.splitMode,
    data.assignments
  );

  return (
    <div className="space-y-6">
      <SummaryHeader session={data.session} />

      <div className="space-y-3">
        {splits.map((split) => (
          <PersonCard key={split.participant.id} split={split} />
        ))}
      </div>

      <PaymentDetails session={data.session} />

      <ExportAll
        splits={splits}
        sessionTitle={data.session.title}
        payment={{
          name: data.session.pay_name,
          bank: data.session.pay_bank,
          account: data.session.pay_account,
        }}
        qrUrl={data.session.pay_qr_url}
      />
    </div>
  );
}
