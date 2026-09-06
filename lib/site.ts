export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export const siteName = "ATSDekho";

export const defaultTitle = "ATSDekho — See what Naukri actually reads";

export const defaultDescription =
  "Indian ATS resume fixer for Naukri, IIMJobs, and LinkedIn. Upload a resume and a JD. We show the parser extract, then rewrite a .docx that survives the filter. ₹199 per resume.";

export const faqs = [
  {
    q: "Why does a good resume still fail Naukri?",
    a: "Naukri does not “read” the page the way you do. It concatenates text left to right. A two-column CV turns “Priya Sharma” and “Java” into one nonsense line. Skills in tables, emails in headers, and phone icons never become fields. You look unqualified to the filter, not to a human.",
  },
  {
    q: "How is this different from Jobscan or Rezi?",
    a: "Those products are tuned for Workday, Greenhouse, and Lever. Naukri still prefers .docx under 2MB, strips headers, and fills Key Skills from a clearly labelled skills block. We score for that pipeline, not California enterprise ATS.",
  },
  {
    q: "Will you add skills I never used?",
    a: "No. If Kubernetes is in the JD and not in your file, we flag it. We will not write it into KEY SKILLS. Recruiters in Bengaluru check. Lying fails later and gets you blacklisted on the same portals.",
  },
  {
    q: "What do you charge?",
    a: "₹199 once on download, or sign in with Google and pay ₹499/month for unlimited rewrites on that account. We look up the plan in Razorpay against your Google email. Cancel in Razorpay.",
  },
];
