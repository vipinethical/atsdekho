import { resumeToDocx } from "@/lib/export-docx";
import { resumeToPdf } from "@/lib/export-pdf";
import { fileSlug } from "@/lib/resume-format";
import type { RewrittenResume } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    rewrite?: RewrittenResume;
    format?: "docx" | "pdf";
  };
  if (!body.rewrite?.name) {
    return Response.json({ error: "Nothing to export." }, { status: 400 });
  }

  const format = body.format === "pdf" ? "pdf" : "docx";
  const slug = fileSlug(body.rewrite.name);

  if (format === "pdf") {
    const buffer = await resumeToPdf(body.rewrite);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${slug}-resume.pdf"`,
      },
    });
  }

  const buffer = await resumeToDocx(body.rewrite);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${slug}-resume.docx"`,
    },
  });
}
