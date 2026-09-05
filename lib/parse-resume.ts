import { DEGREES, SECTION_MAP, findCities, findSkills } from "./lexicon";
import { collapseRepeatedPhrase, sameText, uniqueConsecutive, uniqueConsecutiveLines } from "./dedupe";
import type {
  DetectedSection,
  EducationItem,
  ExperienceItem,
  ParsedResume,
} from "./types";

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_RE = /(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}/;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?/i;
const DATE_RE =
  /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*'?\d{2,4}|\d{1,2}[\/\-]\d{4}|\b(?:19|20)\d{2}\b/i;
const DATE_TOKEN =
  "(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\\.?\\s*'?\\d{2,4}|\\d{1,2}[/\\-.]\\d{4}|(?:19|20)\\d{2})";
export const DATE_RANGE_RE = new RegExp(
  `${DATE_TOKEN}\\s*(?:[-–—−‐‑‒―]+|\\bto\\b|\\btill\\b)\\s*(?:present|current|date|${DATE_TOKEN})`,
  "i",
);

export function stripDateRanges(line: string): string {
  return collapseRepeatedPhrase(
    line.replace(new RegExp(DATE_RANGE_RE.source, "gi"), " "),
  );
}

export function isRoleTitle(line: string): boolean {
  return /\b(intern|developer|engineer|designer|manager|lead|analyst|consultant|architect|programmer|specialist|officer|executive|trainee)\b/i.test(
    line,
  );
}

export function isEmployerLine(line: string): boolean {
  return (
    /\b(pvt\.?|ltd\.?|limited|labs|technologies|solutions|inc\.?|corp\.?|llp|llc|ventures)\b/i.test(
      line,
    ) ||
    /,\s*(haryana|karnataka|maharashtra|delhi|noida|gurgaon|gurugram|bangalore|bengaluru|hyderabad|pune|mumbai|chennai)/i.test(
      line,
    )
  );
}

function normalizeHeading(line: string) {
  return line.replace(/[:\-–—]+$/, "").replace(/\s+/g, " ").trim();
}

function isHeading(line: string) {
  const clean = normalizeHeading(line);
  if (clean.length < 3 || clean.length > 48) return false;
  if (EMAIL_RE.test(clean) || PHONE_RE.test(clean)) return false;
  return SECTION_MAP.some((s) => s.match.test(clean));
}

function canonicalFor(line: string): DetectedSection | null {
  const clean = normalizeHeading(line);
  const hit = SECTION_MAP.find((s) => s.match.test(clean));
  if (!hit) return null;
  return {
    heading: clean,
    canonical: hit.canonical,
    body: "",
    standardHeading: hit.standard,
  };
}

export function splitSections(text: string): DetectedSection[] {
  const lines = text.split(/\n/);
  const sections: DetectedSection[] = [];
  let current: DetectedSection = {
    heading: "Header",
    canonical: "other",
    body: "",
    standardHeading: false,
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (isHeading(line)) {
      if (current.body.trim() || current.heading !== "Header") {
        sections.push(current);
      }
      current = canonicalFor(line) ?? {
        heading: line,
        canonical: "other",
        body: "",
        standardHeading: false,
      };
    } else if (line) {
      current.body += (current.body ? "\n" : "") + line;
    }
  }
  sections.push(current);
  return sections.filter((s) => s.body.trim() || s.heading !== "Header");
}

const NAME_STOP = new Set([
  "key",
  "skills",
  "software",
  "engineer",
  "developer",
  "experience",
  "summary",
  "profile",
  "bengaluru",
  "bangalore",
  "hyderabad",
  "mumbai",
  "pune",
  "chennai",
  "delhi",
]);

function guessName(text: string, sections: DetectedSection[]): string | null {
  const header = sections.find((s) => s.heading === "Header")?.body ?? text;
  const lines = header.split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 8)) {
    if (EMAIL_RE.test(line) || PHONE_RE.test(line) || LINKEDIN_RE.test(line)) continue;
    if (isHeading(line)) continue;
    const words = line
      .replace(/[^A-Za-z.\s]/g, " ")
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 1 && !NAME_STOP.has(w.toLowerCase()));
    if (words.length >= 2 && words.length <= 4) {
      return words.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
  }
  return null;
}

function jobFromHeader(line: string): ExperienceItem {
  const dates = collapseRepeatedPhrase(line.match(DATE_RANGE_RE)?.[0] ?? "");
  const parts = stripDateRanges(line)
    .split(/\s*[|•·]\s*/)
    .map((part) => collapseRepeatedPhrase(part))
    .filter(Boolean);
  const first = parts[0] ?? "";
  const second = parts[1] && !sameText(parts[1], first) ? parts[1] : "";
  const companyFirst = isEmployerLine(first) && !isRoleTitle(first);
  return {
    company: companyFirst ? first : second && isEmployerLine(second) ? second : first,
    title: companyFirst ? second : second && isEmployerLine(second) ? first : second,
    dates,
    bullets: [],
    dateParsed: Boolean(dates),
  };
}

function parseExperience(body: string): ExperienceItem[] {
  const lines = uniqueConsecutive(body.split("\n"));
  const items: ExperienceItem[] = [];
  let current: ExperienceItem | null = null;

  for (const raw of lines) {
    const line = collapseRepeatedPhrase(raw);
    const hasDates = DATE_RANGE_RE.test(line);
    const markedBullet = /^[-–—*•·●]/.test(line);
    const isBullet = markedBullet || (line.length > 90 && !hasDates);
    const looksLikeHeader =
      hasDates ||
      isEmployerLine(line) ||
      /[|•·]/.test(line) ||
      (isRoleTitle(line) &&
        line.split(/\s+/).length <= 5 &&
        line.length < 50 &&
        !/[.]/.test(line));

    if (looksLikeHeader && !isBullet) {
      if (
        current &&
        isRoleTitle(current.company) &&
        !current.title &&
        isEmployerLine(line) &&
        !hasDates
      ) {
        current.title = stripDateRanges(current.company);
        current.company = line;
        continue;
      }
      if (
        current &&
        isEmployerLine(current.company) &&
        !current.title &&
        (hasDates || isRoleTitle(line)) &&
        !isEmployerLine(line)
      ) {
        current.title = stripDateRanges(line);
        if (hasDates) {
          current.dates = collapseRepeatedPhrase(line.match(DATE_RANGE_RE)?.[0] ?? current.dates);
          current.dateParsed = Boolean(current.dates);
        }
        continue;
      }
      if (current && sameText(stripDateRanges(line), current.company)) continue;
      if (current) items.push(current);
      current = jobFromHeader(line);
    } else if (
      current &&
      !current.title &&
      !isBullet &&
      line.length < 70 &&
      !DATE_RE.test(line) &&
      !sameText(line, current.company)
    ) {
      current.title = line;
    } else if (current) {
      const bullet = collapseRepeatedPhrase(line.replace(/^[-–—*•·●]\s*/, ""));
      const leftover = stripDateRanges(bullet);
      if (
        !bullet ||
        sameText(bullet, current.company) ||
        sameText(bullet, current.title) ||
        (current.dates && sameText(bullet, current.dates)) ||
        current.bullets.some((existing) => sameText(existing, bullet)) ||
        (hasDates && leftover.length < 40 && isRoleTitle(leftover))
      ) {
        continue;
      }
      current.bullets.push(bullet);
    }
  }
  if (current) items.push(current);
  return items.slice(0, 8);
}

function parseEducation(body: string): EducationItem[] {
  return uniqueConsecutive(body.split("\n"))
    .slice(0, 6)
    .map((line) => {
      const lower = line.toLowerCase();
      const degree = DEGREES.find((d) => lower.includes(d)) ?? null;
      const year = line.match(/\b(19|20)\d{2}\b/)?.[0] ?? null;
      return { line, degree, year };
    });
}

function yearsFromText(text: string): number | null {
  const match = text.match(/(\d+(?:\.\d+)?)\s*\+?\s*(?:years|yrs)/i);
  if (match) return Number(match[1]);
  return null;
}

export function parseResume(parserText: string, headerFooter: string[]): ParsedResume {
  const cleaned = uniqueConsecutiveLines(parserText);
  const sections = splitSections(cleaned);
  const skillsSection = sections.find((s) => s.canonical === "skills");
  const experienceSection = sections.find((s) => s.canonical === "experience");
  const educationSection = sections.find((s) => s.canonical === "education");
  const allSkills = findSkills(cleaned);
  const email = cleaned.match(EMAIL_RE)?.[0] ?? null;
  const phone = cleaned.match(PHONE_RE)?.[0] ?? null;
  const linkedin = cleaned.match(LINKEDIN_RE)?.[0] ?? null;
  const location = findCities(cleaned);

  const inHeader = (value: string | null) =>
    Boolean(
      value &&
        headerFooter.some((h) => h.toLowerCase().includes(value.toLowerCase())),
    );

  return {
    name: guessName(cleaned, sections),
    contact: {
      email: { value: email, found: Boolean(email), inHeaderOrFooter: inHeader(email) },
      phone: { value: phone, found: Boolean(phone), inHeaderOrFooter: inHeader(phone) },
      location: { value: location, found: Boolean(location) },
      linkedin: { value: linkedin, found: Boolean(linkedin) },
    },
    sections,
    skills: skillsSection ? findSkills(skillsSection.body) : allSkills.slice(0, 8),
    skillsInDedicatedSection: Boolean(skillsSection),
    experience: experienceSection ? parseExperience(experienceSection.body) : [],
    education: educationSection ? parseEducation(educationSection.body) : [],
    yearsExperience: yearsFromText(cleaned),
  };
}

export { EMAIL_RE, PHONE_RE };
