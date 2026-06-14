// Off-screen card captured by dom-to-image-more.
// ALL styles must be inline — no Tailwind classes (they don't resolve during capture).

import type { PersonSplit } from "@/types/session";

interface Props {
  split: PersonSplit;
  sessionTitle: string;
  ref: React.Ref<HTMLDivElement>;
}

export function ExportCard({ split, sessionTitle, ref }: Props) {
  const { participant, subtotal, service_charge, tax, total, items } = split;

  const formatMYR = (n: number) =>
    new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" }).format(n);

  return (
    <div
      ref={ref}
      style={{
        width: 360,
        backgroundColor: "#FFFBEB",
        borderRadius: 16,
        padding: 24,
        fontFamily: "'Nunito Sans', Arial, sans-serif",
        color: "#1C1917",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16, borderBottom: "2px solid #F1E8E2", paddingBottom: 12 }}>
        <p style={{ fontSize: 11, color: "#78716C", margin: 0, letterSpacing: 1, textTransform: "uppercase" }}>
          {sessionTitle}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: participant.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {participant.name.charAt(0).toUpperCase()}
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{participant.name}</p>
        </div>
      </div>

      {/* Items */}
      <div style={{ marginBottom: 12 }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
              fontSize: 13,
            }}
          >
            <span style={{ color: "#57534E", flex: 1, marginRight: 8 }}>{item.name}</span>
            <span style={{ fontWeight: 600 }}>{formatMYR(item.share)}</span>
          </div>
        ))}
      </div>

      {/* Subtotals */}
      <div style={{ borderTop: "1px solid #F1E8E2", paddingTop: 10, marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
          <span style={{ color: "#78716C" }}>Subtotal</span>
          <span>{formatMYR(subtotal)}</span>
        </div>
        {service_charge > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: "#78716C" }}>Service charge</span>
            <span>{formatMYR(service_charge)}</span>
          </div>
        )}
        {tax > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: "#78716C" }}>Tax</span>
            <span>{formatMYR(tax)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div
        style={{
          backgroundColor: "#C2410C",
          borderRadius: 10,
          padding: "10px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>You owe</span>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>{formatMYR(total)}</span>
      </div>

      {/* Footer */}
      <p style={{ textAlign: "center", fontSize: 10, color: "#A8A29E", marginTop: 14, marginBottom: 0 }}>
        👑 Cozy Crown
      </p>
    </div>
  );
}
