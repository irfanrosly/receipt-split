import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { WizardItem, WizardParticipant, WizardCharges, SplitMode } from "@/types/session";
import type { AssignmentMap } from "@/lib/split/calculator";
import { computeSubtotal, computeTotals } from "@/lib/split/calculator";
import { buildSessionSplitInput } from "./mappers";

type Client = SupabaseClient<Database>;

export interface SaveSessionInput {
  userId: string;
  title: string;
  receiptUrl?: string | null;
  items: WizardItem[];
  participants: WizardParticipant[];
  splitMode: SplitMode;
  assignments: AssignmentMap;
  charges: WizardCharges;
}

export async function saveSessionFromWizard(
  supabase: Client,
  input: SaveSessionInput
): Promise<string> {
  const subtotal = computeSubtotal(input.items);
  const { grand } = computeTotals(subtotal, input.charges);

  const { data: session, error: sessionErr } = await supabase
    .from("sessions")
    .insert({
      user_id: input.userId,
      title: input.title.trim() || "Receipt",
      receipt_url: input.receiptUrl ?? null,
      split_mode: input.splitMode,
      subtotal,
      service_pct: input.charges.service_pct,
      tax_pct: input.charges.tax_pct,
      tax_on: input.charges.tax_on,
      total: grand,
      status: "draft",
    })
    .select("id")
    .single();

  if (sessionErr || !session) {
    throw sessionErr ?? new Error("Session insert failed");
  }

  const sessionId = session.id;

  try {
    const participantRows = input.participants.map((p, idx) => ({
      session_id: sessionId,
      name: p.name,
      color: p.color,
      sort_order: idx,
    }));

    const { error: partErr } = await supabase.from("participants").insert(participantRows);
    if (partErr) throw partErr;

    const itemRows = input.items.map((item, idx) => ({
      session_id: sessionId,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      sort_order: idx,
    }));

    const { error: itemErr } = await supabase.from("items").insert(itemRows);
    if (itemErr) throw itemErr;

    if (input.splitMode === "per_item") {
      const [{ data: dbItems }, { data: dbParticipants }] = await Promise.all([
        supabase.from("items").select("id, sort_order").eq("session_id", sessionId).order("sort_order"),
        supabase
          .from("participants")
          .select("id, sort_order")
          .eq("session_id", sessionId)
          .order("sort_order"),
      ]);

      if (dbItems && dbParticipants) {
        const wizardPidToDbPid = new Map<string, string>();
        input.participants.forEach((p, idx) => {
          const dbP = dbParticipants[idx];
          if (dbP) wizardPidToDbPid.set(p.id, dbP.id);
        });

        const assignmentRows: Database["public"]["Tables"]["item_assignments"]["Insert"][] = [];
        input.items.forEach((wizardItem, idx) => {
          const dbItem = dbItems[idx];
          if (!dbItem) return;
          const assignedWizardPids = input.assignments[wizardItem.id] ?? [];
          if (assignedWizardPids.length === 0) return;
          for (const wizardPid of assignedWizardPids) {
            const dbPid = wizardPidToDbPid.get(wizardPid);
            if (dbPid) {
              assignmentRows.push({
                item_id: dbItem.id,
                participant_id: dbPid,
                session_id: sessionId,
              });
            }
          }
        });

        if (assignmentRows.length > 0) {
          const { error: assignErr } = await supabase.from("item_assignments").insert(assignmentRows);
          if (assignErr) throw assignErr;
        }
      }
    }

    return sessionId;
  } catch (err) {
    await supabase.from("sessions").delete().eq("id", sessionId);
    throw err;
  }
}

export async function loadSessionForSplit(supabase: Client, sessionId: string, userId: string) {
  const { data: session, error: sessionErr } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (sessionErr || !session) return null;

  const [{ data: dbParticipants }, { data: dbItems }, { data: dbAssignments }] = await Promise.all([
    supabase.from("participants").select("*").eq("session_id", sessionId).order("sort_order"),
    supabase.from("items").select("*").eq("session_id", sessionId).order("sort_order"),
    supabase.from("item_assignments").select("*").eq("session_id", sessionId),
  ]);

  return buildSessionSplitInput(
    session,
    dbParticipants ?? [],
    dbItems ?? [],
    dbAssignments ?? []
  );
}

export async function deleteSession(
  supabase: Client,
  sessionId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function uploadReceiptImage(
  supabase: Client,
  userId: string,
  sessionId: string,
  file: File
): Promise<string | null> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${sessionId}.${ext}`;

  const { error: uploadErr } = await supabase.storage.from("receipts").upload(path, file, {
    upsert: true,
    contentType: file.type || "image/jpeg",
  });

  if (uploadErr) {
    console.error("Receipt upload failed", uploadErr);
    return null;
  }

  const { data } = supabase.storage.from("receipts").getPublicUrl(path);
  return data.publicUrl;
}
