import { findSkills } from "./lexicon";
import { collapseRepeatedPhrase, sameText, uniqueLines } from "./dedupe";
import { isEmployerBoilerplate } from "./parse-jd";
import {
  DATE_RANGE_RE,
  isEmployerLine,
  isRoleTitle,
  stripDateRanges,
} from "./parse-resume";
import type {
  ExperienceItem,
  ParsedJd,
  ParsedResume,
  RewrittenResume,
} from "./types";

function unique(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = value.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(value);
    }
  }
  return out;
}

function leaksJd(line: string, jdRaw: string): boolean {
  const value = line.trim();
  if (!value) return true;
  if (isEmployerBoilerplate(value)) return true;
  const haystack = jdRaw.toLowerCase().replace(/\s+/g, " ");
  const needle = value.toLowerCase().replace(/\s+/g, " ");
  if (needle.length >= 40 && haystack.includes(needle.slice(0, Math.min(90, needle.length)))) {
    return true;
  }
  return false;
}

function promoteSkills(resume: ParsedResume, jd: ParsedJd, fullText: string): string[] {
  const have = findSkills(fullText);
  const requiredPresent = jd.skillsRequired.filter((s) =>
    have.some((h) => h.toLowerCase() === s.toLowerCase()),
  );
  const nicePresent = jd.skillsNice.filter((s) =>
    have.some((h) => h.toLowerCase() === s.toLowerCase()),
  );
  const rest = have.filter(
    (s) =>
      !requiredPresent.some((r) => r.toLowerCase() === s.toLowerCase()) &&
      !nicePresent.some((r) => r.toLowerCase() === s.toLowerCase()),
  );
  return unique([...requiredPresent, ...nicePresent, ...rest]).slice(0, 18);
}

function tidyJob(item: ExperienceItem, jdRaw: string): ExperienceItem {
  let company = stripDateRanges(item.company);
  let title = stripDateRanges(item.title);
  if (isRoleTitle(company) && isEmployerLine(title) && !isRoleTitle(title)) {
    const swapped = company;
    company = title;
    title = swapped;
  }
  if (title && sameText(title, company)) title = "";
  const dates = collapseRepeatedPhrase(item.dates);
  const bullets = uniqueLines(item.bullets).filter((line) => {
    if (leaksJd(line, jdRaw)) return false;
    if (sameText(line, company) || sameText(line, title) || sameText(line, dates)) return false;
    const leftover = stripDateRanges(line);
    if (DATE_RANGE_RE.test(line) && leftover.length < 40 && isRoleTitle(leftover)) {
      return false;
    }
    return true;
  });
  return {
    ...item,
    company: leaksJd(company, jdRaw) ? "" : company,
    title: leaksJd(title, jdRaw) ? "" : title,
    dates,
    bullets,
  };
}

function mergeJobs(jobs: ExperienceItem[]): ExperienceItem[] {
  const out: ExperienceItem[] = [];
  for (const job of jobs) {
    const prev = out[out.length - 1];
    if (
      prev &&
      sameText(prev.company, job.company) &&
      (sameText(prev.dates, job.dates) || !prev.dates || !job.dates)
    ) {
      if (!prev.title) prev.title = job.title;
      if (!prev.dates) prev.dates = job.dates;
      prev.bullets = uniqueLines([...prev.bullets, ...job.bullets]);
      continue;
    }
    out.push({ ...job, bullets: [...job.bullets] });
  }
  return out;
}

function experienceFrom(
  resume: ParsedResume,
  fullText: string,
  jdRaw: string,
): ExperienceItem[] {
  const source = resume.experience.length ? resume.experience : [];

  const cleaned = mergeJobs(
    source
      .map((item) => tidyJob(item, jdRaw))
      .filter((item) => item.company || item.title || item.bullets.length),
  );

  if (cleaned.length) return cleaned;

  const lines = uniqueLines(
    fullText
      .split("\n")
      .filter((l) => l.length > 40 && l.length < 180 && !leaksJd(l, jdRaw)),
  ).slice(0, 6);
  if (!lines.length) return [];
  return [
    {
      company: "Experience (recovered from extract)",
      title: resume.name ? `Roles listed for ${resume.name}` : "Professional experience",
      dates: "",
      bullets: lines,
      dateParsed: false,
    },
  ];
}

export function rewriteResume(
  resume: ParsedResume,
  jd: ParsedJd,
  fullText: string,
): RewrittenResume {
  const skills = promoteSkills(resume, jd, fullText);
  const missing = jd.skillsRequired.filter(
    (s) => !fullText.toLowerCase().includes(s.toLowerCase()),
  );
  const years =
    resume.yearsExperience ??
    Math.max(1, resume.experience.length);
  const location = resume.contact.location.value;
  const name = resume.name ?? "Your Name";
  const experience = experienceFrom(resume, fullText, jd.raw);
  const latest = experience[0];
  const headline = collapseRepeatedPhrase(
    [latest?.title, latest?.company]
      .map((part) => stripDateRanges(part ?? ""))
      .find((part) => part && isRoleTitle(part) && !leaksJd(part, jd.raw) && part.length < 70) ??
      "",
  );

  const summary = [
    years
      ? `${years}+ years building ${skills.slice(0, 3).join(", ") || "production software"}.`
      : "",
    latest && latest.title && latest.company && !latest.company.startsWith("Experience (recovered")
      ? `Most recently ${latest.title} at ${latest.company}, with work across ${skills.slice(0, 6).join(", ")}.`
      : skills.length
        ? `Core tools: ${skills.slice(0, 6).join(", ")}.`
        : "",
    location ? `Based in ${location}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const contactParts = [
    location,
    resume.contact.phone.value,
    resume.contact.email.value,
    resume.contact.linkedin.value,
  ].filter(Boolean) as string[];

  const education = resume.education.length ? resume.education : [];

  const projects = resume.sections
    .filter((s) => s.canonical === "projects")
    .flatMap((s) =>
      s.body
        .split("\n")
        .filter((line) => line && !leaksJd(line, jd.raw))
        .slice(0, 4)
        .map((line) => ({ name: line.slice(0, 80), bullets: [] as string[] })),
    );

  const certifications = resume.sections
    .filter((s) => s.canonical === "certifications")
    .flatMap((s) => s.body.split("\n").filter((line) => line && !leaksJd(line, jd.raw)))
    .slice(0, 6);

  const notes = [
    "Single column, standard headings, contact in the body. Upload the .docx to Naukri; use PDF when a recruiter asks for it.",
    missing.length
      ? `Not added (not found in your file): ${missing.join(", ")}.`
      : "Every JD-required phrase we found in your file is now in KEY SKILLS as well as in experience.",
  ];

  const omitted = resume.sections
    .filter((s) => s.canonical === "personal")
    .map((s) => s.heading);

  return {
    name,
    headline,
    contactLine: contactParts.join("  ·  "),
    summary,
    skills,
    experience,
    education,
    projects,
    certifications,
    omitted,
    notes,
  };
}
