import type { Session, Participant, Item, ItemAssignment } from "./database";

export type { Session, Participant, Item, ItemAssignment };

export interface SessionWithRelations extends Session {
  participants: Participant[];
  items: Item[];
  item_assignments: ItemAssignment[];
}

export interface WizardItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
}

export interface WizardParticipant {
  id: string;
  name: string;
  color: string;
}

export type SplitMode = "equal" | "per_item";

export type SessionStatus = "draft" | "settled";

export interface WizardCharges {
  service_pct: number;
  tax_pct: number;
  tax_on: "subtotal" | "after_service";
}

export interface PersonSplit {
  participant: WizardParticipant;
  subtotal: number;
  service_charge: number;
  tax: number;
  total: number;
  items: Array<{
    name: string;
    share: number;
  }>;
}
