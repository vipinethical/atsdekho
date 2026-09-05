import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Tab,
  TabStopType,
  TextRun,
  convertInchesToTwip,
} from "docx";
import { contactBits, formatDates } from "./resume-format";
import type { RewrittenResume } from "./types";

const FONT = "Calibri";
const INK = "1C1917";
const MUTED = "44403C";
const CONTENT_WIDTH = convertInchesToTwip(8.27 - 1.4);

const thinBorder = {
  color: INK,
  space: 4,
  style: BorderStyle.SINGLE,
  size: 8,
};

function run(
  text: string,
  opts?: { bold?: boolean; italics?: boolean; size?: number; color?: string },
) {
  return new TextRun({
    text,
    bold: opts?.bold,
    italics: opts?.italics,
    font: FONT,
    size: opts?.size ?? 21,
    color: opts?.color ?? INK,
  });
}

function heading(text: string) {
  return new Paragraph({
    spacing: { before: 240, after: 80 },
    border: { bottom: thinBorder },
    children: [
      run(text.toUpperCase(), { bold: true, size: 20 }),
    ],
  });
}

function body(text: string, opts?: { italics?: boolean; after?: number }) {
  return new Paragraph({
    spacing: { after: opts?.after ?? 80, line: 276 },
    children: [run(text, { italics: opts?.italics })],
  });
}

function bullet(text: string) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60, line: 276 },
    children: [run(text)],
  });
}

export async function resumeToDocx(resume: RewrittenResume): Promise<Buffer> {
  const bits = contactBits(resume.contactLine);
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        run(resume.name.toUpperCase(), { bold: true, size: 40 }),
      ],
    }),
  ];

  if (resume.headline) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [run(resume.headline, { size: 22 })],
      }),
    );
  }

  if (bits.length) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        border: { bottom: thinBorder },
        children: [run(bits.join("  |  "), { size: 19, color: MUTED })],
      }),
    );
  }

  children.push(heading("Professional Summary"), body(resume.summary));

  if (resume.skills.length) {
    children.push(heading("Key Skills"), body(resume.skills.join(", ")));
  }

  if (resume.experience.length) {
    children.push(heading("Professional Experience"));
    for (const job of resume.experience) {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 20 },
          tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
          children: [
            run(job.company, { bold: true, size: 22 }),
            ...(job.dates
              ? [new Tab(), run(formatDates(job.dates), { size: 20, color: MUTED })]
              : []),
          ],
        }),
      );
      if (job.title && job.title.toLowerCase() !== job.company.toLowerCase()) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [run(job.title, { italics: true, size: 21, color: MUTED })],
          }),
        );
      }
      for (const line of job.bullets) children.push(bullet(line));
    }
  }

  if (resume.education.length) {
    children.push(heading("Education"));
    for (const edu of resume.education) children.push(body(edu.line, { after: 40 }));
  }

  if (resume.projects.length) {
    children.push(heading("Projects"));
    for (const project of resume.projects) {
      children.push(body(project.name, { after: 40 }));
      for (const line of project.bullets) children.push(bullet(line));
    }
  }

  if (resume.certifications.length) {
    children.push(heading("Certifications"));
    for (const cert of resume.certifications) children.push(body(cert, { after: 40 }));
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 21, color: INK },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: convertInchesToTwip(8.27),
              height: convertInchesToTwip(11.69),
            },
            margin: {
              top: convertInchesToTwip(0.6),
              bottom: convertInchesToTwip(0.6),
              left: convertInchesToTwip(0.7),
              right: convertInchesToTwip(0.7),
            },
          },
        },
        children,
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
