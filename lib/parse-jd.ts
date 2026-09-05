import { DEGREES, findCities, findSkills } from "./lexicon";
import type { ParsedJd } from "./types";

const TITLE_LABEL =
  /\b(?:job\s+title|designation|position(?:\s+title)?|role)\s*[:\-–—]\s*(.+)/i;

const BOILERPLATE =
  /\b(we are seeking|we are looking|we're seeking|you will be|the ideal candidate|about (?:the )?role|job description|about us|who we are|what you.?ll|responsibilities|consumer-facing|high-traffic|seasoned|mentoring junior)\b/i;

function sectionAfter(text: string, labels: RegExp): string {
  const match = labels.exec(text);
  if (!match || match.index == null) return "";
  const from = match.index + match[0].length;
  const rest = text.slice(from);
  const next = rest.search(
    /\n(?:good to have|nice to have|responsibilities|about (?:the )?role|education|qualifications)\b/i,
  );
  return (next === -1 ? rest : rest.slice(0, next)).trim();
}

export function isEmployerBoilerplate(text: string): boolean {
  const value = text.trim();
  if (value.length > 180) return true;
  if (BOILERPLATE.test(value)) return true;
  if (/^(we|you|the ideal)\b/i.test(value)) return true;
  return false;
}

export function isPlausibleJobTitle(value: string): boolean {
  const clean = value.replace(/\s+/g, " ").trim().replace(/[.,;:]+$/, "");
  if (clean.length < 4 || clean.length > 68) return false;
  if (isEmployerBoilerplate(clean)) return false;
  const words = clean.split(" ");
  if (words.length > 8) return false;
  return true;
}

function extractJobTitle(text: string): string | null {
  const labelled = text.match(TITLE_LABEL);
  if (labelled?.[1]) {
    const fromLabel = labelled[1].split(/\n|\.(?:\s|$)/)[0]?.trim() ?? "";
    if (isPlausibleJobTitle(fromLabel)) return fromLabel.replace(/[.,;:]+$/, "");
  }

  for (const line of text.split("\n").map((l) => l.trim()).filter(Boolean)) {
    if (isPlausibleJobTitle(line) && /\b(engineer|developer|manager|designer|analyst|architect|lead|consultant|specialist)\b/i.test(line)) {
      return line.replace(/[.,;:]+$/, "");
    }
  }
  return null;
}

export function parseJd(text: string): ParsedJd {
  const skills = findSkills(text);
  const mustBlock = sectionAfter(
    text,
    /(?:must have|mandatory|required skills|requirements|what you.?ll need)\s*:?/i,
  );
  const niceBlock = sectionAfter(
    text,
    /(?:good to have|nice to have|preferred|bonus)\s*:?/i,
  );
  const mustSkills = mustBlock ? findSkills(mustBlock) : skills.slice(0, 8);
  const niceSkills = niceBlock ? findSkills(niceBlock) : [];
  const years =
    text.match(/(\d+)\s*[-–to]+\s*(\d+)\s*(?:years|yrs)/i) ||
    text.match(/(\d+)\+\s*(?:years|yrs)/i) ||
    text.match(/experience\s*[:\-]\s*(\d+)/i);

  return {
    title: extractJobTitle(text),
    location: findCities(text),
    yearsMin: years ? Number(years[1]) : null,
    yearsMax: years && years[2] ? Number(years[2]) : null,
    education: DEGREES.filter((d) => text.toLowerCase().includes(d)).slice(0, 4),
    notice: text.match(/\b(\d+\s*days?|immediate joiner|serving notice)\b/i)?.[0] ?? null,
    skillsRequired: mustSkills.length ? mustSkills : skills.slice(0, 10),
    skillsNice: niceSkills.filter((s) => !mustSkills.includes(s)),
    keywords: [...new Set([...mustSkills, ...niceSkills, ...skills])].slice(0, 24),
    raw: text,
  };
}
