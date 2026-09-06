import type { Metadata } from "next";
import { ScanClient } from "@/components/ScanClient";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

const description =
  "Upload a PDF or Word resume and a Naukri, IIMJobs, or LinkedIn job description. See the parser extract, then download a single-column ATS-safe rewrite.";

export const metadata: Metadata = {
  title: "Scan a resume for Naukri ATS",
  description,
  alternates: { canonical: "/scan" },
  openGraph: {
    title: "Scan a resume for Naukri ATS",
    description,
    url: "/scan",
    siteName: "ATSDekho",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scan a resume for Naukri ATS",
    description,
  },
};

export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ sample?: string; plan?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-5 py-10">
        <p className="text-xs uppercase tracking-[0.22em] text-accent">Scanner</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
          Resume + JD in. Parser extract out.
        </h1>
        <p className="mt-3 max-w-2xl text-muted leading-7">
          Pick the portal you are applying on. We score the file the way that
          parser reads — not the way it looks in Word.
        </p>
        <ScanClient autoSample={params.sample === "1"} preferMonthly={params.plan === "monthly"} />
      </main>
      <SiteFooter />
    </div>
  );
}
