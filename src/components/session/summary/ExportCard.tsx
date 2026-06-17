// Off-screen card captured by html-to-image.
// ALL styles must be inline — no Tailwind classes (they don't resolve during capture).

import type { PersonSplit } from "@/types/session";
import { readableTextColor } from "@/lib/utils";

export interface CardPayment {
  name: string | null;
  bank: string | null;
  account: string | null;
}

interface Props {
  split: PersonSplit;
  sessionTitle: string;
  payment: CardPayment | null;
  qrDataUrl: string | null;
  ref: React.Ref<HTMLDivElement>;
}

export function ExportCard({ split, sessionTitle, payment, qrDataUrl, ref }: Props) {
  const { participant, subtotal, service_charge, tax, total, items } = split;

  const hasPaymentText = !!(payment && (payment.name || payment.bank || payment.account));
  const showPayment = hasPaymentText || !!qrDataUrl;

  const formatMYR = (n: number) =>
    new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" }).format(n);

  return (
    <div
      ref={ref}
      style={{
        width: 360,
        backgroundColor: "#FAFAFA",
        borderRadius: 16,
        padding: 24,
        fontFamily: "var(--font-nunito), 'Trebuchet MS', Arial, sans-serif",
        color: "#18181B",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16, borderBottom: "2px solid #E4E4E7", paddingBottom: 12 }}>
        <p style={{ fontSize: 11, color: "#71717A", margin: 0, letterSpacing: 1, textTransform: "uppercase" }}>
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
              color: readableTextColor(participant.color),
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
            <span style={{ color: "#52525B", flex: 1, marginRight: 8 }}>{item.name}</span>
            <span style={{ fontWeight: 600 }}>{formatMYR(item.share)}</span>
          </div>
        ))}
      </div>

      {/* Subtotals */}
      <div style={{ borderTop: "1px solid #E4E4E7", paddingTop: 10, marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
          <span style={{ color: "#71717A" }}>Subtotal</span>
          <span>{formatMYR(subtotal)}</span>
        </div>
        {service_charge > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: "#71717A", whiteSpace: "nowrap" }}>Service charge</span>
            <span>{formatMYR(service_charge)}</span>
          </div>
        )}
        {tax > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: "#71717A" }}>Tax</span>
            <span>{formatMYR(tax)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div
        style={{
          backgroundColor: "#047857",
          borderRadius: 10,
          padding: "10px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#fff", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap" }}>You owe</span>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>{formatMYR(total)}</span>
      </div>

      {/* Pay to */}
      {showPayment && (
        <div
          style={{
            marginTop: 14,
            borderTop: "1px solid #E4E4E7",
            paddingTop: 12,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 11,
              color: "#71717A",
              margin: 0,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Pay to
          </p>
          {payment?.name && (
            <p style={{ fontSize: 15, fontWeight: 700, margin: "4px 0 0" }}>{payment.name}</p>
          )}
          {payment?.bank && (
            <p style={{ fontSize: 13, color: "#52525B", margin: "2px 0 0" }}>{payment.bank}</p>
          )}
          {payment?.account && (
            <p style={{ fontSize: 14, fontWeight: 600, margin: "2px 0 0", letterSpacing: 0.5 }}>
              {payment.account}
            </p>
          )}
          {qrDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="Payment QR"
              style={{ width: 150, height: 150, objectFit: "contain", margin: "10px auto 0", display: "block" }}
            />
          )}
        </div>
      )}

      {/* Footer */}
      <p style={{ textAlign: "center", fontSize: 10, color: "#A1A1AA", marginTop: 14, marginBottom: 0 }}>
        ✂️ SplitLah
      </p>
    </div>
  );
}
