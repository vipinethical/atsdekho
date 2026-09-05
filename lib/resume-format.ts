import type { RewrittenResume } from "./types";

export function contactBits(line: string): string[] {
  return line
    .split(/\s*[·|]\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function formatDates(dates: string): string {
  return dates.replace(/\s*[-–—]\s*/g, " – ").replace(/\btill date\b/i, "Present");
}

export function fileSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "atsdekho";
}

export function cloneRewrite(resume: RewrittenResume): RewrittenResume {
  return JSON.parse(JSON.stringify(resume)) as RewrittenResume;
}

export function sanitizeRewrite(resume: RewrittenResume): RewrittenResume {
  const skills = resume.skills
    .flatMap((skill) => skill.split(","))
    .map((skill) => skill.trim())
    .filter(Boolean);

  return {
    ...resume,
    name: resume.name.trim() || "Your Name",
    headline: resume.headline.trim(),
    contactLine: resume.contactLine.replace(/\s+/g, " ").trim(),
    summary: resume.summary.trim(),
    skills,
    experience: resume.experience
      .map((job) => ({
        ...job,
        company: job.company.trim(),
        title: job.title.trim(),
        dates: job.dates.trim(),
        bullets: job.bullets.map((line) => line.trim()).filter(Boolean),
      }))
      .filter((job) => job.company || job.title || job.bullets.length),
    education: resume.education
      .map((edu) => ({ ...edu, line: edu.line.trim() }))
      .filter((edu) => edu.line),
    projects: resume.projects
      .map((project) => ({
        name: project.name.trim(),
        bullets: project.bullets.map((line) => line.trim()).filter(Boolean),
      }))
      .filter((project) => project.name || project.bullets.length),
    certifications: resume.certifications.map((line) => line.trim()).filter(Boolean),
  };
}

export function rewriteToPlainText(resume: RewrittenResume): string {
  const jobs = resume.experience
    .map((job) => {
      const head = [job.company, job.title, job.dates ? formatDates(job.dates) : ""]
        .filter(Boolean)
        .join(" | ");
      const bullets = job.bullets.map((b) => `- ${b}`).join("\n");
      return `${head}\n${bullets}`;
    })
    .join("\n");

  return [
    resume.name,
    resume.headline,
    resume.contactLine.replace(/\s*·\s*/g, " | "),
    "",
    "PROFESSIONAL SUMMARY",
    resume.summary,
    "",
    "KEY SKILLS",
    resume.skills.join(", "),
    "",
    "PROFESSIONAL EXPERIENCE",
    jobs,
    resume.education.length
      ? `EDUCATION\n${resume.education.map((e) => e.line).join("\n")}`
      : "",
    resume.projects.length
      ? `PROJECTS\n${resume.projects.map((p) => p.name).join("\n")}`
      : "",
    resume.certifications.length
      ? `CERTIFICATIONS\n${resume.certifications.join("\n")}`
      : "",
  ]
    .filter((block) => block !== "")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
