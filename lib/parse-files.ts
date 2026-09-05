import { extractImages, extractTextItems, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";
import { analyzeLayout, itemsFromPlainText } from "./layout";
import type { LayoutAnalysis, TextItem } from "./types";

function extOf(name: string) {
  const part = name.split(".").pop()?.toLowerCase() ?? "";
  if (part === "pdf") return "pdf";
  if (part === "doc" || part === "docx") return "docx";
  return "txt";
}

async function layoutFromPdf(
  buffer: Uint8Array,
  fileName: string,
  fileBytes: number,
): Promise<LayoutAnalysis> {
  const pdf = await getDocumentProxy(buffer);
  const { items, totalPages } = await extractTextItems(pdf);
  const flat: TextItem[] = items.flatMap((page, index) =>
    page
      .filter((row) => row.str.trim())
      .map((row) => ({
        str: row.str,
        x: row.x,
        y: row.y,
        width: row.width,
        height: row.height,
        page: index + 1,
      })),
  );

  let hasImage = false;
  try {
    const images = await extractImages(pdf, 1);
    hasImage = Array.isArray(images) ? images.length > 0 : Boolean(images);
  } catch {
    hasImage = false;
  }

  return analyzeLayout({
    items: flat,
    pageCount: totalPages,
    hasImage,
    hasTable: false,
    fileBytes,
    fileName,
    fileType: "pdf",
  });
}

async function layoutFromDocx(
  buffer: Buffer,
  fileName: string,
  fileBytes: number,
): Promise<LayoutAnalysis> {
  const [html, raw] = await Promise.all([
    mammoth.convertToHtml({ buffer }),
    mammoth.extractRawText({ buffer }),
  ]);
  const hasTable = /<table/i.test(html.value);
  const hasImage = /<img/i.test(html.value);
  const text = raw.value || html.value.replace(/<[^>]+>/g, "\n");
  const items = itemsFromPlainText(text);
  const twoColTable = hasTable && /<tr[^>]*>\s*<t[dh][^>]*>[\s\S]*?<\/t[dh]>\s*<t[dh]/i.test(html.value);

  return analyzeLayout({
    items: twoColTable ? items : items.map((item) => ({ ...item, x: 40 })),
    pageCount: 1,
    hasImage,
    hasTable,
    fileBytes,
    fileName,
    fileType: "docx",
    fallbackText: text,
  });
}

export async function layoutFromUpload(file: File): Promise<LayoutAnalysis> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const kind = extOf(file.name);
  if (kind === "pdf") {
    return layoutFromPdf(new Uint8Array(bytes), file.name, file.size);
  }
  if (kind === "docx") {
    return layoutFromDocx(bytes, file.name, file.size);
  }
  const text = bytes.toString("utf8");
  return analyzeLayout({
    items: itemsFromPlainText(text),
    pageCount: 1,
    hasImage: false,
    hasTable: false,
    fileBytes: file.size,
    fileName: file.name,
    fileType: "txt",
    fallbackText: text,
  });
}

export function layoutFromPasted(text: string): LayoutAnalysis {
  return analyzeLayout({
    items: itemsFromPlainText(text),
    pageCount: 1,
    hasImage: false,
    hasTable: false,
    fileBytes: text.length,
    fileName: "pasted.txt",
    fileType: "pasted",
    fallbackText: text,
  });
}
