export type Portal = "naukri" | "iimjobs" | "linkedin";

export type Severity = "blocker" | "warning" | "info";

export type TextItem = {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
};

export type LayoutAnalysis = {
  pageCount: number;
  columnCount: 1 | 2 | 3;
  hasImage: boolean;
  hasTable: boolean;
  fileBytes: number;
  fileName: string;
  fileType: "pdf" | "docx" | "txt" | "pasted";
  intendedText: string;
  parserText: string;
  garbledLines: { intended: string; parsed: string }[];
  headerFooterText: string[];
  items: TextItem[];
};

export type ContactField = {
  value: string | null;
  found: boolean;
  inHeaderOrFooter?: boolean;
};

export type ExperienceItem = {
  company: string;
  title: string;
  dates: string;
  bullets: string[];
  dateParsed: boolean;
};

export type EducationItem = {
  line: string;
  degree: string | null;
  year: string | null;
};

export type DetectedSection = {
  heading: string;
  canonical:
    | "summary"
    | "skills"
    | "experience"
    | "education"
    | "projects"
    | "certifications"
    | "personal"
    | "other";
  body: string;
  standardHeading: boolean;
};

export type ParsedResume = {
  name: string | null;
  contact: {
    email: ContactField;
    phone: ContactField;
    location: ContactField;
    linkedin: ContactField;
  };
  sections: DetectedSection[];
  skills: string[];
  skillsInDedicatedSection: boolean;
  experience: ExperienceItem[];
  education: EducationItem[];
  yearsExperience: number | null;
};

export type JdRequirement = {
  skill: string;
  required: boolean;
  foundIn: "skills" | "body" | "missing";
};

export type ParsedJd = {
  title: string | null;
  location: string | null;
  yearsMin: number | null;
  yearsMax: number | null;
  education: string[];
  notice: string | null;
  skillsRequired: string[];
  skillsNice: string[];
  keywords: string[];
  raw: string;
};

export type AtsIssue = {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  evidence?: string;
};

export type MatchBreakdown = {
  keywordCoverage: number;
  parserHealth: number;
  structure: number;
  portalFit: number;
};

export type AnalysisResult = {
  portal: Portal;
  layout: LayoutAnalysis;
  resume: ParsedResume;
  jd: ParsedJd;
  requirements: JdRequirement[];
  issues: AtsIssue[];
  score: number;
  breakdown: MatchBreakdown;
  rewriteScore: number;
  rewriteBreakdown: MatchBreakdown;
  rewrite: RewrittenResume;
};

export type RewrittenResume = {
  name: string;
  headline: string;
  contactLine: string;
  summary: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: { name: string; bullets: string[] }[];
  certifications: string[];
  omitted: string[];
  notes: string[];
};
