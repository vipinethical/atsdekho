import { collectIssues, scoreAnalysis } from "./issues";
import { analyzeLayout } from "./layout";
import { parseJd } from "./parse-jd";
import { layoutFromPasted, layoutFromUpload } from "./parse-files";
import { parseResume } from "./parse-resume";
import { rewriteResume } from "./rewrite";
import { SAMPLE_ITEMS } from "./sample";
import { scoreRewrite } from "./score-rewrite";
import type { AnalysisResult, Portal } from "./types";

export async function runAnalysis(input: {
  portal: Portal;
  jd: string;
  sample?: boolean;
  resumeText?: string;
  file?: File | null;
}): Promise<AnalysisResult> {
  const portal = input.portal;
  const jd = parseJd(input.jd);

  const layout = input.sample
    ? analyzeLayout({
        items: SAMPLE_ITEMS,
        pageCount: 1,
        hasImage: true,
        hasTable: true,
        fileBytes: 480_000,
        fileName: "Priya_Sharma_CV.pdf",
        fileType: "pdf",
      })
    : input.file
      ? await layoutFromUpload(input.file)
      : layoutFromPasted(input.resumeText ?? "");

  const resume = parseResume(layout.parserText, layout.headerFooterText);
  const issues = collectIssues(portal, layout, resume, jd);
  const { score, ...breakdown } = scoreAnalysis(portal, layout, resume, jd, issues);
  const rewrite = rewriteResume(resume, jd, `${layout.intendedText}\n${layout.parserText}`);
  const scoredRewrite = scoreRewrite(portal, jd, rewrite);

  const requirements = [
    ...jd.skillsRequired.map((skill) => ({ skill, required: true })),
    ...jd.skillsNice.map((skill) => ({ skill, required: false })),
  ].map((row) => {
    const inSkills = resume.skills.some((s) => s.toLowerCase() === row.skill.toLowerCase());
    const inBody = layout.parserText.toLowerCase().includes(row.skill.toLowerCase());
    return {
      skill: row.skill,
      required: row.required,
      foundIn: inSkills ? ("skills" as const) : inBody ? ("body" as const) : ("missing" as const),
    };
  });

  return {
    portal,
    layout: { ...layout, items: [] },
    resume,
    jd,
    requirements,
    issues,
    score,
    breakdown,
    rewriteScore: scoredRewrite.score,
    rewriteBreakdown: scoredRewrite.breakdown,
    rewrite,
  };
}
