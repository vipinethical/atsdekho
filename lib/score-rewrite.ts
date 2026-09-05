import { collectIssues, scoreAnalysis } from "./issues";
import { analyzeLayout } from "./layout";
import { parseResume } from "./parse-resume";
import { rewriteToPlainText, sanitizeRewrite } from "./resume-format";
import type { MatchBreakdown, ParsedJd, Portal, RewrittenResume } from "./types";

export type RewriteScore = {
  score: number;
  breakdown: MatchBreakdown;
  missingRequired: string[];
};

export function scoreRewrite(
  portal: Portal,
  jd: ParsedJd,
  rewrite: RewrittenResume,
): RewriteScore {
  const clean = sanitizeRewrite(rewrite);
  const text = rewriteToPlainText(clean);
  const layout = analyzeLayout({
    items: [],
    pageCount: 1,
    hasImage: false,
    hasTable: false,
    fileBytes: 80_000,
    fileName: "atsdekho-rewrite.docx",
    fileType: "docx",
    fallbackText: text,
  });
  const parsed = parseResume(layout.parserText, layout.headerFooterText);
  const issues = collectIssues(portal, layout, parsed, jd);
  const { score, ...breakdown } = scoreAnalysis(portal, layout, parsed, jd, issues);
  const haystack = text.toLowerCase();
  const missingRequired = jd.skillsRequired.filter(
    (skill) => !haystack.includes(skill.toLowerCase()),
  );

  return { score, breakdown, missingRequired };
}
