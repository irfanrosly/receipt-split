import Link from "next/link";
import { Camera, Split, Send, Sparkles, Clock, QrCode, Wallet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PhoneFrame } from "./PhoneFrame";

const HOOKS = [
  { icon: Sparkles, text: "No more awkward “eh, siapa belum bayar?”" },
  { icon: Clock, text: "Settle the whole bill in ~10 seconds" },
  { icon: QrCode, text: "Kawan bayar balik fast — DuitNow QR built in" },
  { icon: Wallet, text: "Free, jalan terus in your browser — no install" },
];

const STEPS = [
  { icon: Camera, title: "Snap the receipt", body: "Amik gambar. We read the items and prices for you." },
  { icon: Split, title: "Split it", body: "Sama rata or item-by-item. Add your geng, we kira." },
  { icon: Send, title: "Share who pays", body: "Everyone gets a card — their share + how to pay you back." },
];

const SHOTS = [
  { src: "/screenshots/scan.png", alt: "Uploading a receipt in SplitLah", caption: "Snap the receipt" },
  { src: "/screenshots/extraction.png", alt: "Items and prices auto-extracted from the receipt", caption: "We auto-read every item & price" },
  { src: "/screenshots/split.png", alt: "Adding people and choosing how to split the bill", caption: "Add your geng, split per item" },
];

export function Landing() {
  return (
    <div className="flex min-h-full flex-col bg-background font-sans text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <span className="font-heading text-xl font-bold text-primary">
            <span aria-hidden="true">✂️ </span>SplitLah
          </span>
          <div className="flex items-center gap-2">
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "min-h-11 px-4")}>
              Log in
            </Link>
            <Link href="/signup" className={cn(buttonVariants(), "min-h-11 px-4")}>
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto w-full max-w-5xl px-4 py-12 md:py-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="space-y-6 text-center md:text-left">
              <h1 className="font-heading text-4xl font-bold leading-tight md:text-5xl">
                Split the bill.
                <br />
                Tak payah pening.
              </h1>
              <p className="mx-auto max-w-md text-lg text-muted-foreground md:mx-0">
                Snap the receipt, we kira for you, and everyone sees exactly what
                they owe — plus how to pay you back. Senang.
              </p>
              <div className="flex flex-col items-center gap-3 sm:flex-row md:justify-start">
                <Link
                  href="/signup"
                  className={cn(buttonVariants(), "min-h-11 w-full px-6 text-base sm:w-auto")}
                >
                  Sign up free
                </Link>
                <Link
                  href="/login"
                  className={cn(buttonVariants({ variant: "ghost" }), "min-h-11 w-full px-6 text-base sm:w-auto")}
                >
                  Log in
                </Link>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[240px]">
              <PhoneFrame src="/screenshots/dashboard.png" alt="The SplitLah dashboard showing your bill-split sessions and totals" />
            </div>
          </div>
        </section>

        {/* Hook strip */}
        <section className="border-y border-border bg-muted/40">
          <div className="mx-auto grid w-full max-w-5xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOOKS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <p className="text-sm font-medium">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto w-full max-w-5xl px-4 py-12 md:py-16">
          <h2 className="text-center font-heading text-2xl font-bold md:text-3xl">
            How it works
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <div key={title} className="space-y-3 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-lg font-bold">
                  <span className="text-primary">{i + 1}.</span> {title}
                </h3>
                <p className="mx-auto max-w-xs text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Screenshot showcase */}
        <section className="border-t border-border bg-muted/40">
          <div className="mx-auto w-full max-w-5xl px-4 py-12 md:py-16">
            <h2 className="text-center font-heading text-2xl font-bold md:text-3xl">
              See it in action
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-3">
              {SHOTS.map(({ src, alt, caption }) => (
                <figure key={src} className="space-y-3">
                  <div className="mx-auto w-full max-w-[200px]">
                    <PhoneFrame src={src} alt={alt} />
                  </div>
                  <figcaption className="text-center text-sm text-muted-foreground">
                    {caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mx-auto w-full max-w-5xl px-4 py-16 text-center">
          <h2 className="font-heading text-3xl font-bold md:text-4xl">
            Ready for the next makan?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Free to use. No app to install. Jalan terus in your browser.
          </p>
          <Link
            href="/signup"
            className={cn(buttonVariants(), "mt-6 min-h-11 px-8 text-base")}
          >
            Sign up free
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <span className="font-heading font-bold text-primary">
            <span aria-hidden="true">✂️ </span>SplitLah
          </span>
          <span>© {new Date().getFullYear()} SplitLah</span>
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </footer>
    </div>
  );
}
