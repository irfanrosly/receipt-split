import type { WizardItem, WizardParticipant, WizardCharges, PersonSplit, SplitMode } from "@/types/session";

export interface AssignmentMap {
  [itemId: string]: string[]; // itemId → participantId[]
}

export function computeSubtotal(items: WizardItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
}

export function calculateSplit(
  items: WizardItem[],
  participants: WizardParticipant[],
  charges: WizardCharges,
  splitMode: SplitMode,
  assignments: AssignmentMap
): PersonSplit[] {
  if (participants.length === 0) return [];

  const subtotal = computeSubtotal(items);

  const service = subtotal * (charges.service_pct / 100);
  const taxBase = charges.tax_on === "after_service" ? subtotal + service : subtotal;
  const tax = taxBase * (charges.tax_pct / 100);
  const totalCharges = service + tax;

  const personSubtotals = new Map<string, number>();
  const personItems = new Map<string, Array<{ name: string; share: number }>>();

  for (const p of participants) {
    personSubtotals.set(p.id, 0);
    personItems.set(p.id, []);
  }

  if (splitMode === "equal") {
    const share = subtotal / participants.length;
    for (const p of participants) {
      personSubtotals.set(p.id, share);
      personItems.set(p.id, items.map((item) => ({
        name: item.name,
        share: (item.quantity * item.unit_price) / participants.length,
      })));
    }
  } else {
    for (const item of items) {
      const itemTotal = item.quantity * item.unit_price;
      const assignees = assignments[item.id] ?? [];
      const effectiveAssignees = assignees.length > 0 ? assignees : participants.map((p) => p.id);
      const sharePerPerson = itemTotal / effectiveAssignees.length;

      for (const pid of effectiveAssignees) {
        personSubtotals.set(pid, (personSubtotals.get(pid) ?? 0) + sharePerPerson);
        personItems.get(pid)?.push({ name: item.name, share: sharePerPerson });
      }
    }
  }

  return participants.map((p) => {
    const personSubtotal = personSubtotals.get(p.id) ?? 0;
    const proportion = subtotal > 0 ? personSubtotal / subtotal : 1 / participants.length;
    const personService = round2(service * proportion);
    const personTax = round2(tax * proportion);

    return {
      participant: p,
      subtotal: round2(personSubtotal),
      service_charge: personService,
      tax: personTax,
      total: round2(personSubtotal + personService + personTax),
      items: (personItems.get(p.id) ?? []).map((i) => ({ ...i, share: round2(i.share) })),
    };
  });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeTotals(
  subtotal: number,
  charges: WizardCharges
): { service: number; tax: number; grand: number } {
  const service = round2(subtotal * (charges.service_pct / 100));
  const taxBase = charges.tax_on === "after_service" ? subtotal + service : subtotal;
  const tax = round2(taxBase * (charges.tax_pct / 100));
  return { service, tax, grand: round2(subtotal + service + tax) };
}
