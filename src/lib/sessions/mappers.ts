import type { WizardItem, WizardParticipant, WizardCharges, SplitMode } from "@/types/session";
import type { AssignmentMap } from "@/lib/split/calculator";
import type { Database } from "@/types/database";

type DbParticipant = Database["public"]["Tables"]["participants"]["Row"];
type DbItem = Database["public"]["Tables"]["items"]["Row"];
type DbAssignment = Database["public"]["Tables"]["item_assignments"]["Row"];
type DbSession = Database["public"]["Tables"]["sessions"]["Row"];

export function mapParticipantsFromDb(rows: DbParticipant[]): WizardParticipant[] {
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    color: p.color ?? "#6B7280",
  }));
}

export function mapItemsFromDb(rows: DbItem[]): WizardItem[] {
  return rows.map((i) => ({
    id: i.id,
    name: i.name,
    quantity: i.quantity,
    unit_price: i.unit_price,
  }));
}

export function mapAssignmentsFromDb(rows: DbAssignment[]): AssignmentMap {
  const assignments: AssignmentMap = {};
  for (const a of rows) {
    if (!assignments[a.item_id]) assignments[a.item_id] = [];
    assignments[a.item_id].push(a.participant_id);
  }
  return assignments;
}

export function mapChargesFromSession(session: DbSession): WizardCharges {
  return {
    service_pct: session.service_pct,
    tax_pct: session.tax_pct,
    tax_on: session.tax_on,
  };
}

export interface SessionSplitInput {
  session: DbSession;
  participants: WizardParticipant[];
  items: WizardItem[];
  assignments: AssignmentMap;
  charges: WizardCharges;
  splitMode: SplitMode;
}

export function buildSessionSplitInput(
  session: DbSession,
  dbParticipants: DbParticipant[],
  dbItems: DbItem[],
  dbAssignments: DbAssignment[]
): SessionSplitInput {
  return {
    session,
    participants: mapParticipantsFromDb(dbParticipants),
    items: mapItemsFromDb(dbItems),
    assignments: mapAssignmentsFromDb(dbAssignments),
    charges: mapChargesFromSession(session),
    splitMode: session.split_mode,
  };
}

export function defaultSessionTitle(): string {
  const date = new Date().toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `Receipt — ${date}`;
}
