import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-2xl tracking-tight">ATSDekho</span>
          <span className="hidden text-xs uppercase tracking-[0.18em] text-muted sm:inline">
            India
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/scan" className="text-muted hover:text-ink">
            Scan a resume
          </Link>
          <Link href="/pricing" className="text-muted hover:text-ink">
            Pricing
          </Link>
          <Link
            href="/scan"
            className="rounded-full bg-accent px-4 py-2 text-sm text-white hover:bg-accent-dark"
          >
            Fix mine
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>ATSDekho — built for Naukri, IIMJobs, and LinkedIn. Not a US ATS clone.</p>
        <p>₹199 per rewrite · we do not invent experience you do not have.</p>
      </div>
    </footer>
  );
}
