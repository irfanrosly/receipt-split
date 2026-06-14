import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type { WizardItem, WizardParticipant, WizardCharges, SplitMode } from "@/types/session";
import type { AssignmentMap } from "@/lib/split/calculator";
import { defaultSessionTitle } from "@/lib/sessions/mappers";
import { PARTICIPANT_COLORS } from "@/lib/utils";

interface WizardState {
  step: number;
  direction: "forward" | "back";
  receiptImageBlob: string | null;
  receiptFile: File | null;
  title: string;
  items: WizardItem[];
  participants: WizardParticipant[];
  splitMode: SplitMode;
  assignments: AssignmentMap;
  charges: WizardCharges;

  setStep: (step: number) => void;
  setReceiptImage: (url: string | null) => void;
  setReceiptFile: (file: File | null) => void;
  setTitle: (title: string) => void;
  setItems: (items: WizardItem[]) => void;
  addItem: () => void;
  updateItem: (id: string, patch: Partial<WizardItem>) => void;
  removeItem: (id: string) => void;
  addParticipant: (name: string) => void;
  removeParticipant: (id: string) => void;
  setSplitMode: (mode: SplitMode) => void;
  setAssignment: (itemId: string, participantIds: string[]) => void;
  setCharges: (charges: Partial<WizardCharges>) => void;
  hydrateFromSession: (data: {
    title: string;
    items: WizardItem[];
    participants: WizardParticipant[];
    splitMode: SplitMode;
    assignments: AssignmentMap;
    charges: WizardCharges;
  }) => void;
  reset: () => void;
}

const defaultCharges: WizardCharges = {
  service_pct: 0,
  tax_pct: 0,
  tax_on: "subtotal",
};

const initialState = {
  step: 1,
  direction: "forward" as const,
  receiptImageBlob: null,
  receiptFile: null,
  title: defaultSessionTitle(),
  items: [] as WizardItem[],
  participants: [] as WizardParticipant[],
  splitMode: "equal" as SplitMode,
  assignments: {} as AssignmentMap,
  charges: defaultCharges,
};

export function hasWizardDraft(state: Pick<WizardState, "step" | "items" | "participants">): boolean {
  return state.step > 1 || state.items.length > 0 || state.participants.length > 0;
}

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set((s) => ({ step, direction: step > s.step ? "forward" : "back" })),
      setReceiptImage: (url) => set({ receiptImageBlob: url }),
      setReceiptFile: (file) => set({ receiptFile: file }),
      setTitle: (title) => set({ title }),

      setItems: (items) => set({ items }),
      addItem: () =>
        set((s) => ({
          items: [...s.items, { id: uuid(), name: "", quantity: 1, unit_price: 0 }],
        })),
      updateItem: (id, patch) =>
        set((s) => ({
          items: s.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        })),
      removeItem: (id) =>
        set((s) => ({
          items: s.items.filter((item) => item.id !== id),
          assignments: Object.fromEntries(
            Object.entries(s.assignments).filter(([k]) => k !== id)
          ),
        })),

      addParticipant: (name) =>
        set((s) => {
          const color = PARTICIPANT_COLORS[s.participants.length % PARTICIPANT_COLORS.length];
          return { participants: [...s.participants, { id: uuid(), name, color }] };
        }),
      removeParticipant: (id) =>
        set((s) => ({
          participants: s.participants.filter((p) => p.id !== id),
          assignments: Object.fromEntries(
            Object.entries(s.assignments).map(([k, ids]) => [k, ids.filter((pid) => pid !== id)])
          ),
        })),

      setSplitMode: (splitMode) => set({ splitMode }),
      setAssignment: (itemId, participantIds) =>
        set((s) => ({
          assignments: { ...s.assignments, [itemId]: participantIds },
        })),
      setCharges: (patch) => set((s) => ({ charges: { ...s.charges, ...patch } })),

      hydrateFromSession: (data) =>
        set({
          step: 2,
          direction: "forward",
          receiptImageBlob: null,
          receiptFile: null,
          title: data.title,
          items: data.items,
          participants: data.participants,
          splitMode: data.splitMode,
          assignments: data.assignments,
          charges: data.charges,
        }),

      reset: () => set({ ...initialState, title: defaultSessionTitle() }),
    }),
    {
      name: "cozy-crown-wizard",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        step: state.step,
        direction: state.direction,
        title: state.title,
        items: state.items,
        participants: state.participants,
        splitMode: state.splitMode,
        assignments: state.assignments,
        charges: state.charges,
      }),
    }
  )
);
