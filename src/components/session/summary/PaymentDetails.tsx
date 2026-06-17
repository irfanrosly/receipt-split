"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { uploadPaymentQr, savePaymentDetails } from "@/lib/sessions/saveSessionFromWizard";
import type { Session } from "@/types/database";

interface Props {
  session: Session;
}

export function PaymentDetails({ session }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(session.pay_name ?? "");
  const [bank, setBank] = useState(session.pay_bank ?? "");
  const [account, setAccount] = useState(session.pay_account ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(session.pay_qr_url);
  const [saving, setSaving] = useState(false);

  const hasDetails = !!(session.pay_name || session.pay_account || session.pay_qr_url);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = createClient();
      let qrUrl = session.pay_qr_url;

      if (file) {
        const uploaded = await uploadPaymentQr(supabase, session.user_id, session.id, file);
        if (!uploaded) {
          toast.error("QR upload failed. Try again.");
          setSaving(false);
          return;
        }
        // Cache-bust: same storage path reuses the URL, so force a fresh fetch.
        qrUrl = `${uploaded}?t=${Date.now()}`;
      }

      await savePaymentDetails(supabase, session.id, session.user_id, {
        pay_name: name.trim() || null,
        pay_bank: bank.trim() || null,
        pay_account: account.trim() || null,
        pay_qr_url: qrUrl,
      });

      toast.success("Payment details saved");
      setFile(null);
      router.refresh();
    } catch (err) {
      console.error("Save payment details failed", err);
      toast.error("Could not save. Try again.");
    }
    setSaving(false);
  }

  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-left min-h-11"
      >
        <Wallet className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium flex-1">
          Payment details
          {hasDetails && <span className="ml-2 text-xs text-muted-foreground">· set</span>}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <CardContent className="space-y-4 pt-0">
          <p className="text-xs text-muted-foreground">
            Shown on each person&apos;s card so they know who to pay.
          </p>

          <div className="space-y-2">
            <Label htmlFor="pay_name">Account holder</Label>
            <Input
              id="pay_name"
              placeholder="e.g. Irfan Rosly"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pay_bank">Bank</Label>
            <Input
              id="pay_bank"
              placeholder="e.g. Maybank"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="min-h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pay_account">Account number</Label>
            <Input
              id="pay_account"
              placeholder="e.g. 1234 5678 9012"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              inputMode="numeric"
              className="min-h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pay_qr">DuitNow QR image</Label>
            <input
              id="pay_qr"
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:text-primary"
            />
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="QR preview"
                className="mt-2 h-32 w-32 rounded-md border object-contain"
              />
            )}
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full min-h-11">
            {saving ? "Saving..." : "Save payment details"}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
