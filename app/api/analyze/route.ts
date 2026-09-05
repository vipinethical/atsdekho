import { runAnalysis } from "@/lib/analyze";
import type { Portal } from "@/lib/types";

export const runtime = "nodejs";

const PORTALS: Portal[] = ["naukri", "iimjobs", "linkedin"];

export async function POST(request: Request) {
  const form = await request.formData();
  const portalRaw = String(form.get("portal") ?? "naukri");
  const portal = PORTALS.includes(portalRaw as Portal)
    ? (portalRaw as Portal)
    : "naukri";
  const jd = String(form.get("jd") ?? "").trim();
  const resumeText = String(form.get("resumeText") ?? "");
  const sample = String(form.get("sample") ?? "") === "true";
  const file = form.get("file");

  if (!jd) {
    return Response.json({ error: "Paste a job description first." }, { status: 400 });
  }
  if (!sample && !(file instanceof File) && !resumeText.trim()) {
    return Response.json(
      { error: "Upload a resume, paste the text, or try the sample." },
      { status: 400 },
    );
  }

  try {
    const result = await runAnalysis({
      portal,
      jd,
      sample,
      resumeText,
      file: file instanceof File && file.size > 0 ? file : null,
    });
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not parse that file.";
    return Response.json({ error: message }, { status: 500 });
  }
}
