import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

const description =
  "₹199 for one ATS-safe Naukri resume rewrite, or ₹499/month for unlimited rewrites while you apply. Scan first. We do not invent skills you never used.";

export const metadata: Metadata = {
  title: "Pricing",
  description,
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "ATSDekho pricing",
    description,
    url: "/pricing",
    siteName: "ATSDekho",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ATSDekho pricing",
    description,
  },
};

export default function PricingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-5 py-16">
        <p className="text-xs uppercase tracking-[0.22em] text-accent">Pricing</p>
        <h1 className="mt-3 font-serif text-5xl tracking-tight">Pay once, or keep applying.</h1>
        <p className="mt-4 max-w-xl text-muted leading-7">
          Students and job-switchers already pay for this. We charge less than
          a neighbourhood resume shop, and we show the parser extract so you
          know what you bought.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <article className="border border-line bg-card p-8">
            <h2 className="font-serif text-3xl">One resume</h2>
            <p className="mt-4 font-serif text-5xl">₹199</p>
            <p className="mt-1 text-sm text-muted">UPI, cards, netbanking via Razorpay</p>
            <ul className="mt-6 space-y-2 text-sm leading-6 text-muted">
              <li>Parser view for Naukri, IIMJobs, or LinkedIn</li>
              <li>JD keyword match without fake skills</li>
              <li>ATS-safe .docx download</li>
            </ul>
            <a
              href="/scan"
              className="mt-8 inline-block rounded-full bg-ink px-5 py-2.5 text-sm text-paper"
            >
              Scan first, pay on download
            </a>
          </article>
          <article className="border border-ink bg-ink p-8 text-paper">
            <h2 className="font-serif text-3xl">Switching jobs</h2>
            <p className="mt-4 font-serif text-5xl">₹499<span className="text-xl">/mo</span></p>
            <p className="mt-1 text-sm text-paper/60">unlimited rewrites while you apply</p>
            <ul className="mt-6 space-y-2 text-sm leading-6 text-paper/75">
              <li>Every JD gets its own keyword order</li>
              <li>Keep the same truthful experience block</li>
              <li>Built for campus + 2–8 year switchers</li>
            </ul>
            <a
              href="/scan?plan=monthly"
              className="mt-8 inline-block rounded-full bg-paper px-5 py-2.5 text-sm text-ink"
            >
              Scan, then start ₹499/month
            </a>
          </article>
        </div>
        <p className="mt-10 max-w-2xl text-sm leading-6 text-muted">
          Checkout is Razorpay: UPI first, then cards and netbanking. You scan for free. ₹199
          unlocks Word and PDF for that rewrite. ₹499/month needs Google sign-in — the plan sits
          on that Gmail, so the next laptop still sees it. Recurring charges usually need a card
          or UPI Autopay.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
