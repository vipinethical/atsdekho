import type {
  AnalysisResult,
  AtsIssue,
  LayoutAnalysis,
  ParsedJd,
  ParsedResume,
  Portal,
} from "./types";

export function collectIssues(
  portal: Portal,
  layout: LayoutAnalysis,
  resume: ParsedResume,
  jd: ParsedJd,
): AtsIssue[] {
  const issues: AtsIssue[] = [];

  if (layout.columnCount > 1) {
    issues.push({
      id: "columns",
      severity: "blocker",
      title: `${layout.columnCount}-column layout will scramble on ${portalLabel(portal)}`,
      detail:
        portal === "naukri"
          ? "Naukri reads left-to-right per line. Skills sitting in a right-hand column get stitched into your name, title, and dates."
          : "Multi-column CVs are parsed as a single stream. Section order is lost and keywords often never land in the skills field.",
      evidence: layout.garbledLines[0]?.parsed,
    });
  }

  if (layout.hasTable) {
    issues.push({
      id: "tables",
      severity: "blocker",
      title: "Tables detected",
      detail:
        "Indian portal parsers concatenate table cells. A skills grid becomes one run-on string, or drops cells entirely.",
    });
  }

  if (layout.hasImage) {
    issues.push({
      id: "image",
      severity: portal === "naukri" ? "blocker" : "warning",
      title: "Image or photo in the file",
      detail:
        "Text next to a photo, icon, or letterhead is frequently skipped. Contact icons (phone/mail glyphs) are worse: the number never becomes text.",
    });
  }

  if (layout.fileType === "pdf" && portal === "naukri") {
    issues.push({
      id: "pdf-naukri",
      severity: "warning",
      title: "Naukri still parses .docx more reliably than PDF",
      detail:
        "Their pipeline is Word-first. A single-column .docx under 2MB is the format that survives the parser. We'll export that.",
    });
  }

  if (layout.fileBytes > 2 * 1024 * 1024 && portal === "naukri") {
    issues.push({
      id: "filesize",
      severity: "blocker",
      title: "File is over Naukri's 2MB resume cap",
      detail: `This file is ${(layout.fileBytes / (1024 * 1024)).toFixed(1)}MB. Naukri rejects or silently truncates oversized uploads.`,
    });
  }

  if (!resume.contact.email.found) {
    issues.push({
      id: "email",
      severity: "blocker",
      title: "Parser did not read an email address",
      detail:
        "If the email sits in the header, footer, text box, or next to an icon, Naukri's body extract never sees it. Put it as plain text under your name.",
    });
  } else if (resume.contact.email.inHeaderOrFooter && layout.columnCount > 1) {
    issues.push({
      id: "email-header",
      severity: "warning",
      title: "Email appears only in header/footer band",
      detail: "Many ATS engines strip repeating headers. Duplicate the address in the body.",
      evidence: resume.contact.email.value ?? undefined,
    });
  }

  if (!resume.contact.phone.found) {
    issues.push({
      id: "phone",
      severity: "blocker",
      title: "No Indian mobile number in the extract",
      detail: "Use a 10-digit number with optional +91, as selectable text — not an image.",
    });
  }

  if (!resume.skillsInDedicatedSection) {
    issues.push({
      id: "skills-section",
      severity: "blocker",
      title: "No KEY SKILLS section",
      detail:
        "Naukri copies comma-separated skills from a clearly headed skills block into the profile. Buried mentions inside bullets are not the same thing.",
    });
  }

  const creative = resume.sections.filter((s) => !s.standardHeading && s.heading !== "Header");
  if (creative.length) {
    issues.push({
      id: "headings",
      severity: "warning",
      title: "Non-standard section headings",
      detail: `The parser looks for Education, Key Skills, Professional Experience. It will miss “${creative[0].heading}”.`,
      evidence: creative.map((s) => s.heading).join(", "),
    });
  }

  if (resume.sections.some((s) => s.canonical === "personal")) {
    issues.push({
      id: "declaration",
      severity: "info",
      title: "Personal details / declaration section",
      detail:
        "Father's name, passport, and “I hereby declare…” waste parser attention and never help shortlisting. Drop them from the uploaded file.",
    });
  }

  const missingRequired = jd.skillsRequired.filter(
    (skill) =>
      !resume.skills.some((s) => s.toLowerCase() === skill.toLowerCase()) &&
      !layout.parserText.toLowerCase().includes(skill.toLowerCase()),
  );
  if (missingRequired.length) {
    issues.push({
      id: "missing-skills",
      severity: "warning",
      title: `${missingRequired.length} JD-required skill${missingRequired.length > 1 ? "s" : ""} not in the resume`,
      detail:
        "We will not invent tools you have not used. If you have used them, add the exact phrase. If not, leave them off — recruiters check.",
      evidence: missingRequired.slice(0, 8).join(", "),
    });
  }

  const buried = jd.skillsRequired.filter((skill) => {
    const inBody = layout.parserText.toLowerCase().includes(skill.toLowerCase());
    const inSkills = resume.skills.some((s) => s.toLowerCase() === skill.toLowerCase());
    return inBody && !inSkills;
  });
  if (buried.length) {
    issues.push({
      id: "buried-skills",
      severity: "warning",
      title: "Required skills are buried outside the skills block",
      detail:
        "The rewrite will promote phrases that already appear in your experience so the skills field actually fills.",
      evidence: buried.join(", "),
    });
  }

  if (resume.experience.length === 0) {
    issues.push({
      id: "experience",
      severity: "blocker",
      title: "No parseable employment history",
      detail:
        "Use Company | Role | MMM YYYY – MMM YYYY on one line. “Present” or “Till date” both work; fancy timelines do not.",
    });
  } else if (resume.experience.some((e) => !e.dateParsed)) {
    issues.push({
      id: "dates",
      severity: "warning",
      title: "Some roles have dates the parser could not read",
      detail: "Prefer Jan 2022 – Present over “two years” or “’22–now”.",
    });
  }

  if (portal === "iimjobs" && resume.education.length === 0) {
    issues.push({
      id: "education-iim",
      severity: "warning",
      title: "Education block missing — IIMJobs weighs it",
      detail: "Degree, institute, and year on one line. Do not hide it in a sidebar.",
    });
  }

  if (portal === "linkedin") {
    issues.push({
      id: "linkedin-profile",
      severity: "info",
      title: "Easy Apply often ignores this PDF",
      detail:
        "If you apply via Easy Apply, LinkedIn Recruiter searches your profile headline, About, and Skills — not this file. Mirror the rewritten keywords there too.",
    });
  }

  if (layout.garbledLines.length >= 3) {
    issues.push({
      id: "garbled",
      severity: "blocker",
      title: `${layout.garbledLines.length} lines where the parser mixed two columns`,
      detail: `That is the usual reason a qualified profile scores as “incomplete” on ${portalLabel(portal)}.`,
      evidence: layout.garbledLines[0]?.parsed,
    });
  }

  return issues;
}

function portalLabel(portal: Portal) {
  if (portal === "naukri") return "Naukri";
  if (portal === "iimjobs") return "IIMJobs";
  return "LinkedIn";
}

export function scoreAnalysis(
  portal: Portal,
  layout: LayoutAnalysis,
  resume: ParsedResume,
  jd: ParsedJd,
  _issues: AtsIssue[],
): AnalysisResult["breakdown"] & { score: number } {
  const required = jd.skillsRequired.length || 1;
  const covered = jd.skillsRequired.filter((skill) =>
    layout.parserText.toLowerCase().includes(skill.toLowerCase()),
  ).length;
  const keywordCoverage = Math.round((covered / required) * 100);

  let parserHealth = 100;
  if (layout.columnCount > 1) parserHealth -= 35;
  if (layout.hasTable) parserHealth -= 20;
  if (layout.hasImage && portal === "naukri") parserHealth -= 15;
  if (!resume.contact.email.found) parserHealth -= 15;
  if (!resume.contact.phone.found) parserHealth -= 10;
  parserHealth = Math.max(0, parserHealth);

  let structure = 100;
  if (!resume.skillsInDedicatedSection) structure -= 30;
  if (resume.experience.length === 0) structure -= 30;
  if (resume.sections.some((s) => !s.standardHeading && s.canonical === "other" && s.heading !== "Header")) structure -= 15;
  if (resume.education.length === 0) structure -= portal === "iimjobs" ? 20 : 10;
  structure = Math.max(0, structure);

  let portalFit = 80;
  if (portal === "naukri" && layout.fileType === "docx" && layout.columnCount === 1) portalFit = 95;
  if (portal === "naukri" && layout.fileType === "pdf") portalFit -= 10;
  if (portal === "linkedin") portalFit = 75;
  if (_issues.some((i) => i.id === "filesize")) portalFit -= 20;

  const score = Math.round(
    keywordCoverage * 0.4 + parserHealth * 0.25 + structure * 0.2 + portalFit * 0.15,
  );

  return { keywordCoverage, parserHealth, structure, portalFit, score };
}
