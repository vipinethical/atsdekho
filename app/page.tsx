import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { jsonLdScript } from "@/lib/json-ld";
import { defaultDescription, faqs, getSiteUrl, siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "ATSDekho — See what Naukri actually reads" },
  description: defaultDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: "ATSDekho — See what Naukri actually reads",
    description: defaultDescription,
    url: "/",
    siteName: "ATSDekho",
    locale: "en_IN",
    type: "website",
  },
};

const steps = [
  {
    n: "01",
    title: "Upload resume + JD",
    body: "PDF or Word from Naukri, plus the posting from Naukri, IIMJobs, or LinkedIn.",
  },
  {
    n: "02",
    title: "See the extract",
    body: "We simulate how Indian portals read the file: line-by-line, columns mashed, tables dropped.",
  },
  {
    n: "03",
    title: "Download a parser-safe .docx",
    body: "Single column, standard headings, JD phrases promoted only if they already appear in your file.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: siteName,
      url: getSiteUrl(),
      description: defaultDescription,
      inLanguage: "en-IN",
    },
    {
      "@type": "SoftwareApplication",
      name: siteName,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "199",
        priceCurrency: "INR",
      },
      description: defaultDescription,
      url: getSiteUrl(),
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    },
  ],
};

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
        />
        <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-6">
            <p className="text-xs uppercase tracking-[0.22em] text-accent">
              For Naukri · IIMJobs · LinkedIn
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-[1.1] tracking-tight sm:text-6xl">
              See what the parser actually reads.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-muted">
              Qualified candidates fail ATS filters because Naukri never sees
              the skills sitting in a right-hand column. We show the garbled
              extract, then rewrite a file it can parse. ₹199.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/scan"
                className="rounded-full bg-ink px-6 py-3 text-sm text-paper hover:bg-black"
              >
                Scan a resume
              </Link>
              <Link
                href="/scan?sample=1"
                className="rounded-full border border-ink/15 px-6 py-3 text-sm hover:border-ink/40"
              >
                Run the Priya Sharma demo
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted">
              No US keyword stuffing. No fake years. .docx under 2MB — the
              format Naukri still prefers.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line shadow-[8px_8px_0_0_#1c1917]">
              <div className="grid gap-px sm:grid-cols-2">
                <div className="bg-card p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    You designed
                  </p>
                  <pre className="mt-4 font-sans text-[13px] leading-6 text-ink">
                    {`PRIYA SHARMA          KEY SKILLS
Bengaluru             Java
SOFTWARE ENGINEER     Spring Boot
5 years               Microservices`}
                  </pre>
                </div>
                <div className="bg-ink p-5 text-paper">
                  <p className="text-xs uppercase tracking-[0.18em] text-paper/60">
                    Naukri extracted
                  </p>
                  <pre className="mt-4 font-sans text-[13px] leading-6 text-[#f3c1a8]">
                    {`PRIYA SHARMA KEY SKILLS
Bengaluru Java
SOFTWARE ENGINEER Spring Boot
5 years Microservices`}
                  </pre>
                </div>
              </div>
              <div className="bg-card px-5 py-4 text-sm text-muted">
                That mash-up is why a 5-year Java engineer shows up as
                “incomplete profile” and never reaches the recruiter.
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-card">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.n}>
                <p className="font-serif text-3xl text-accent">{step.n}</p>
                <h2 className="mt-3 font-serif text-2xl">{step.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="max-w-2xl">
            <h2 className="font-serif text-4xl tracking-tight">
              Built for Indian portals, not Greenhouse.
            </h2>
            <p className="mt-4 text-muted leading-7">
              Global tools optimise for Workday. Naukri still fills Key Skills
              from a labelled block, drops header text, and punishes photos.
              IIMJobs cares about a clean education line. LinkedIn Easy Apply
              often ignores the PDF and searches your profile instead — we tell
              you when that is the real problem.
            </p>
          </div>
          <dl className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="border border-line bg-card p-6">
              <dt className="text-xs uppercase tracking-[0.18em] text-muted">
                One rewrite
              </dt>
              <dd className="mt-2 font-serif text-4xl">₹199</dd>
              <p className="mt-2 text-sm text-muted">UPI, cards, netbanking</p>
            </div>
            <div className="border border-line bg-card p-6">
              <dt className="text-xs uppercase tracking-[0.18em] text-muted">
                Unlimited / month
              </dt>
              <dd className="mt-2 font-serif text-4xl">₹499</dd>
            </div>
            <div className="border border-line bg-card p-6">
              <dt className="text-xs uppercase tracking-[0.18em] text-muted">
                Typical agency CV
              </dt>
              <dd className="mt-2 font-serif text-4xl">₹2,000+</dd>
              <p className="mt-2 text-sm text-muted">
                Often a designed PDF Naukri cannot parse.
              </p>
            </div>
          </dl>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <h2 className="font-serif text-4xl tracking-tight">Questions</h2>
            <div className="mt-10 grid gap-10 md:grid-cols-2">
              {faqs.map((item) => (
                <div key={item.q}>
                  <h3 className="font-serif text-xl">{item.q}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
