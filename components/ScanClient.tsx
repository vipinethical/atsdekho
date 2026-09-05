"use client";

import { useEffect, useMemo, useState } from "react";
import { ResumePreview } from "@/components/ResumePreview";
import { PORTALS } from "@/lib/lexicon";
import { cloneRewrite, sanitizeRewrite } from "@/lib/resume-format";
import { SAMPLE_JD, SAMPLE_RESUME_TEXT } from "@/lib/sample";
import { scoreRewrite } from "@/lib/score-rewrite";
import type { AnalysisResult, Portal, RewrittenResume } from "@/lib/types";

type Tab = "parser" | "match" | "issues";

export function ScanClient({ autoSample }: { autoSample: boolean }) {
  const [portal, setPortal] = useState<Portal>("naukri");
  const [jd, setJd] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [useSample, setUseSample] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [draft, setDraft] = useState<RewrittenResume | null>(null);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<Tab>("parser");
  const [downloading, setDownloading] = useState<"docx" | "pdf" | null>(null);

  useEffect(() => {
    if (!autoSample) return;
    setJd(SAMPLE_JD);
    setResumeText(SAMPLE_RESUME_TEXT);
    setUseSample(true);
    void analyze({
      sample: true,
      jdText: SAMPLE_JD,
      resume: SAMPLE_RESUME_TEXT,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- demo boot
  }, [autoSample]);

  async function analyze(opts?: { sample?: boolean; jdText?: string; resume?: string }) {
    const asSample = opts?.sample ?? useSample;
    const jdValue = opts?.jdText ?? jd;
    const resumeValue = opts?.resume ?? resumeText;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("portal", portal);
      form.set("jd", jdValue);
      form.set("resumeText", resumeValue);
      form.set("sample", asSample ? "true" : "false");
      if (file && !asSample) form.set("file", file);
      const response = await fetch("/api/analyze", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Scan failed");
      const next = data as AnalysisResult;
      setResult(next);
      setDraft(cloneRewrite(next.rewrite));
      setEditing(false);
      setTab("issues");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  function loadSample() {
    setJd(SAMPLE_JD);
    setResumeText(SAMPLE_RESUME_TEXT);
    setFile(null);
    setUseSample(true);
    void analyze({
      sample: true,
      jdText: SAMPLE_JD,
      resume: SAMPLE_RESUME_TEXT,
    });
  }

  async function download(format: "docx" | "pdf") {
    const rewrite = draft ? sanitizeRewrite(draft) : result?.rewrite;
    if (!rewrite) return;
    setDownloading(format);
    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewrite, format }),
      });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${rewrite.name.replace(/\s+/g, "_")}_ATSDekho.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setDownloading(null);
    }
  }

  const scoreTone =
    (result?.score ?? 0) >= 75 ? "text-good" : (result?.score ?? 0) >= 50 ? "text-warn" : "text-bad";

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-12">
      <form
        className="lg:col-span-4 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void analyze();
        }}
      >
        <fieldset>
          <legend className="text-xs uppercase tracking-[0.18em] text-muted">Portal</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {PORTALS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPortal(item.id)}
                className={`rounded-full border px-2 py-2 text-xs ${
                  portal === item.id
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-card text-muted hover:border-ink/30"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs leading-5 text-muted">
            {PORTALS.find((item) => item.id === portal)?.blurb}
          </p>
        </fieldset>

        <label className="block">
          <span className="text-xs uppercase tracking-[0.18em] text-muted">Job description</span>
          <textarea
            value={jd}
            onChange={(event) => setJd(event.target.value)}
            rows={10}
            placeholder="Paste the Naukri / IIMJobs / LinkedIn posting"
            className="mt-2 w-full resize-y rounded-md border border-line bg-card px-3 py-2 text-sm leading-6 outline-none focus:border-ink"
          />
        </label>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-[0.18em] text-muted">
            Resume (PDF, Word, or paste)
          </span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-chip file:px-3 file:py-1.5"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setUseSample(false);
            }}
          />
          <textarea
            value={resumeText}
            onChange={(event) => {
              setResumeText(event.target.value);
              setUseSample(false);
            }}
            rows={6}
            placeholder="Or paste resume text if the PDF is a scan"
            className="w-full resize-y rounded-md border border-line bg-card px-3 py-2 text-sm leading-6 outline-none focus:border-ink"
          />
        </div>

        {error ? <p className="text-sm text-bad">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-accent px-5 py-2.5 text-sm text-white hover:bg-accent-dark disabled:opacity-60"
          >
            {loading ? "Reading parser…" : "Show what it reads"}
          </button>
          <button
            type="button"
            onClick={loadSample}
            className="rounded-full border border-ink/15 px-5 py-2.5 text-sm"
          >
            Load sample
          </button>
        </div>
      </form>

      <div className="lg:col-span-8">
        {!result ? (
          <div className="border border-dashed border-line bg-card/60 p-10 text-sm leading-7 text-muted">
            Run a scan. The rewritten resume and download buttons show up first.
            Parser, JD match, and issues stay underneath if you want the
            diagnosis.
          </div>
        ) : (
          <Results
            result={result}
            draft={draft ?? result.rewrite}
            editing={editing}
            onDraftChange={setDraft}
            onToggleEdit={() => {
              if (editing && draft) setDraft(sanitizeRewrite(draft));
              setEditing((value) => !value);
            }}
            onReset={() => {
              setDraft(cloneRewrite(result.rewrite));
              setEditing(false);
            }}
            tab={tab}
            setTab={setTab}
            scoreTone={scoreTone}
            onDownload={download}
            downloading={downloading}
          />
        )}
      </div>
    </div>
  );
}

function Results({
  result,
  draft,
  editing,
  onDraftChange,
  onToggleEdit,
  onReset,
  tab,
  setTab,
  scoreTone,
  onDownload,
  downloading,
}: {
  result: AnalysisResult;
  draft: RewrittenResume;
  editing: boolean;
  onDraftChange: (next: RewrittenResume) => void;
  onToggleEdit: () => void;
  onReset: () => void;
  tab: Tab;
  setTab: (tab: Tab) => void;
  scoreTone: string;
  onDownload: (format: "docx" | "pdf") => void;
  downloading: "docx" | "pdf" | null;
}) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "issues", label: "Issues" },
    { id: "match", label: "JD match" },
    { id: "parser", label: "Parser" },
  ];

  return (
    <div className="space-y-8">
      <RewritePanel
        result={result}
        draft={draft}
        editing={editing}
        onDraftChange={onDraftChange}
        onToggleEdit={onToggleEdit}
        onReset={onReset}
        onDownload={onDownload}
        downloading={downloading}
      />

      <div>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              This upload · {result.layout.fileName} · {result.portal}
            </p>
            <p className={`font-serif text-5xl leading-none ${scoreTone}`}>{result.score}</p>
            <p className="mt-1 text-sm text-muted">
              Why the original file scored this — not the rewrite above.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
            <Metric label="Keywords" value={result.breakdown.keywordCoverage} />
            <Metric label="Parser" value={result.breakdown.parserHealth} />
            <Metric label="Structure" value={result.breakdown.structure} />
            <Metric label="Portal" value={result.breakdown.portalFit} />
          </dl>
        </div>

        <div className="mt-4 flex gap-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                tab === item.id ? "bg-ink text-paper" : "bg-chip text-muted"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "parser" ? <ParserTab result={result} /> : null}
          {tab === "match" ? <MatchTab result={result} /> : null}
          {tab === "issues" ? <IssuesTab result={result} /> : null}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-serif text-2xl">{value}</dd>
    </div>
  );
}

function ParserTab({ result }: { result: AnalysisResult }) {
  const fields = [
    ["Name", result.resume.name],
    ["Email", result.resume.contact.email.value],
    ["Phone", result.resume.contact.phone.value],
    ["Location", result.resume.contact.location.value],
    ["Skills block", result.resume.skills.join(", ") || null],
  ] as const;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label} className="border border-line bg-card p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
            <p className={`mt-2 text-sm ${value ? "text-ink" : "text-bad"}`}>
              {value || "Not in the extract"}
            </p>
          </div>
        ))}
      </div>

      {result.layout.garbledLines.length ? (
        <div>
          <h3 className="font-serif text-2xl">Lines the parser mashed</h3>
          <ul className="mt-3 space-y-3">
            {result.layout.garbledLines.map((line) => (
              <li key={line.parsed} className="border border-line bg-card p-4 text-sm">
                <p className="text-muted">{line.intended}</p>
                <p className="mt-1 text-bad">{line.parsed}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <pre className="max-h-[420px] overflow-auto border border-line bg-card p-4 text-xs leading-5">
          <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted">
            Intended reading (column-aware)
          </p>
          {result.layout.intendedText}
        </pre>
        <pre className="max-h-[420px] overflow-auto bg-ink p-4 text-xs leading-5 text-[#f3c1a8]">
          <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-paper/50">
            What the portal reads
          </p>
          {result.layout.parserText}
        </pre>
      </div>
    </div>
  );
}

function MatchTab({ result }: { result: AnalysisResult }) {
  return (
    <div>
      <p className="text-sm text-muted">
        Target role: {result.jd.title ?? "not detected"}
        {result.jd.location ? ` · ${result.jd.location}` : ""}
        {result.jd.yearsMin != null ? ` · ${result.jd.yearsMin}+ years` : ""}
      </p>
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-[0.16em] text-muted">
            <th className="py-2 font-normal">Phrase</th>
            <th className="py-2 font-normal">JD</th>
            <th className="py-2 font-normal">Parser</th>
          </tr>
        </thead>
        <tbody>
          {result.requirements.map((row) => (
            <tr key={row.skill} className="border-b border-line/70">
              <td className="py-2">{row.skill}</td>
              <td className="py-2 text-muted">{row.required ? "Must have" : "Nice"}</td>
              <td
                className={`py-2 ${
                  row.foundIn === "missing"
                    ? "text-bad"
                    : row.foundIn === "body"
                      ? "text-warn"
                      : "text-good"
                }`}
              >
                {row.foundIn === "skills"
                  ? "In skills block"
                  : row.foundIn === "body"
                    ? "Buried in body"
                    : "Not in file"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IssuesTab({ result }: { result: AnalysisResult }) {
  return (
    <ul className="space-y-4">
      {result.issues.map((issue) => (
        <li key={issue.id} className="border border-line bg-card p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">{issue.severity}</p>
          <h3 className="mt-1 font-serif text-xl">{issue.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{issue.detail}</p>
          {issue.evidence ? (
            <p className="mt-2 font-mono text-xs text-bad">{issue.evidence}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function RewritePanel({
  result,
  draft,
  editing,
  onDraftChange,
  onToggleEdit,
  onReset,
  onDownload,
  downloading,
}: {
  result: AnalysisResult;
  draft: RewrittenResume;
  editing: boolean;
  onDraftChange: (next: RewrittenResume) => void;
  onToggleEdit: () => void;
  onReset: () => void;
  onDownload: (format: "docx" | "pdf") => void;
  downloading: "docx" | "pdf" | null;
}) {
  const busy = downloading !== null;
  const dirty = JSON.stringify(draft) !== JSON.stringify(result.rewrite);
  const live = useMemo(
    () => scoreRewrite(result.portal, result.jd, draft),
    [result.portal, result.jd, draft],
  );
  const leftover =
    live.missingRequired.length
      ? ` Still missing from this rewrite: ${live.missingRequired.join(", ")}.`
      : live.score >= 90
        ? " Parser and structure are fixed."
        : " Keywords match; leftover points are portal or structure.";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-6 border border-ink bg-card px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-accent">Rewritten resume</p>
          <p className="mt-1 font-serif text-5xl leading-none text-good">{live.score}</p>
          <p className="mt-2 text-sm text-muted">
            After ATSDekho · was {result.score} on the file you uploaded.
            {leftover}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
          <Metric label="Keywords" value={live.breakdown.keywordCoverage} />
          <Metric label="Parser" value={live.breakdown.parserHealth} />
          <Metric label="Structure" value={live.breakdown.structure} />
          <Metric label="Portal" value={live.breakdown.portalFit} />
        </dl>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => onDownload("docx")}
          disabled={busy}
          className="rounded-full bg-accent px-5 py-2.5 text-sm text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {downloading === "docx" ? "Preparing Word…" : "Download Word (.docx)"}
        </button>
        <button
          type="button"
          onClick={() => onDownload("pdf")}
          disabled={busy}
          className="rounded-full border border-ink/20 bg-card px-5 py-2.5 text-sm hover:border-ink/50 disabled:opacity-60"
        >
          {downloading === "pdf" ? "Preparing PDF…" : "Download PDF"}
        </button>
        <button
          type="button"
          onClick={onToggleEdit}
          className="rounded-full border border-ink/20 bg-card px-5 py-2.5 text-sm hover:border-ink/50"
        >
          {editing ? "Done" : "Edit resume"}
        </button>
        {dirty ? (
          <button
            type="button"
            onClick={onReset}
            className="rounded-full px-3 py-2 text-sm text-muted hover:text-ink"
          >
            Reset
          </button>
        ) : null}
        <p className="text-sm text-muted">
          {editing
            ? "Downloads use the text on this page."
            : ".docx for Naukri · PDF for email / LinkedIn"}
        </p>
      </div>
      <p className="text-sm leading-6 text-muted">
        Single column, standard headings, contact in the body. Upload the .docx to Naukri; use PDF
        when a recruiter asks for it.
      </p>
      <p className="text-sm leading-6 text-muted">
        {live.missingRequired.length
          ? `Not in this rewrite yet: ${live.missingRequired.join(", ")}.`
          : "Every JD-required phrase is now in this rewrite."}
      </p>
      <ResumePreview resume={draft} editing={editing} onChange={onDraftChange} />
    </div>
  );
}
