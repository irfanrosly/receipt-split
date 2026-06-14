import { describe, expect, it } from "vitest";
import {
  calculateSplit,
  computeSubtotal,
  computeTotals,
} from "@/lib/split/calculator";
import type { WizardCharges, WizardItem, WizardParticipant } from "@/types/session";

const participants: WizardParticipant[] = [
  { id: "a", name: "Alice", color: "#f00" },
  { id: "b", name: "Bob", color: "#0f0" },
];

const items: WizardItem[] = [
  { id: "i1", name: "Nasi", quantity: 1, unit_price: 10 },
  { id: "i2", name: "Teh", quantity: 2, unit_price: 3 },
];

const charges: WizardCharges = {
  service_pct: 10,
  tax_pct: 6,
  tax_on: "subtotal",
};

describe("computeSubtotal", () => {
  it("sums quantity * unit_price", () => {
    expect(computeSubtotal(items)).toBe(16);
  });
});

describe("computeTotals", () => {
  it("applies service and tax on subtotal", () => {
    const subtotal = 100;
    const result = computeTotals(subtotal, { service_pct: 10, tax_pct: 6, tax_on: "subtotal" });
    expect(result.service).toBe(10);
    expect(result.tax).toBe(6);
    expect(result.grand).toBe(116);
  });

  it("applies tax after service when configured", () => {
    const subtotal = 100;
    const result = computeTotals(subtotal, {
      service_pct: 10,
      tax_pct: 10,
      tax_on: "after_service",
    });
    expect(result.service).toBe(10);
    expect(result.tax).toBe(11);
    expect(result.grand).toBe(121);
  });
});

describe("calculateSplit", () => {
  it("splits equally among participants", () => {
    const splits = calculateSplit(items, participants, charges, "equal", {});
    expect(splits).toHaveLength(2);
    expect(splits[0].subtotal).toBe(8);
    expect(splits[1].subtotal).toBe(8);
    expect(splits[0].total + splits[1].total).toBeCloseTo(computeTotals(16, charges).grand, 1);
  });

  it("splits per item with assignments", () => {
    const splits = calculateSplit(items, participants, charges, "per_item", {
      i1: ["a"],
      i2: ["b"],
    });
    expect(splits.find((s) => s.participant.id === "a")?.subtotal).toBe(10);
    expect(splits.find((s) => s.participant.id === "b")?.subtotal).toBe(6);
  });

  it("falls back to equal assignees when item is unassigned", () => {
    const splits = calculateSplit(items, participants, charges, "per_item", {
      i1: ["a"],
    });
    const bob = splits.find((s) => s.participant.id === "b");
    expect(bob?.subtotal).toBe(3);
  });

  it("returns empty array when no participants", () => {
    expect(calculateSplit(items, [], charges, "equal", {})).toEqual([]);
  });
});
