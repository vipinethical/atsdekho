import { collapseRepeatedPhrase, uniqueConsecutiveLines } from "./dedupe";
import type { LayoutAnalysis, TextItem } from "./types";

const LINE_TOLERANCE = 5;

function itemMidY(item: TextItem) {
  return item.y + item.height / 2;
}

export function clusterLines(items: TextItem[]): TextItem[][] {
  const sorted = [...items]
    .filter((item) => item.str.trim())
    .sort((a, b) => a.page - b.page || b.y - a.y || a.x - b.x);

  const lines: TextItem[][] = [];
  for (const item of sorted) {
    const last = lines[lines.length - 1];
    if (
      last &&
      last[0].page === item.page &&
      Math.abs(itemMidY(last[0]) - itemMidY(item)) <= LINE_TOLERANCE
    ) {
      last.push(item);
      last.sort((a, b) => a.x - b.x);
    } else {
      lines.push([item]);
    }
  }
  return lines;
}

export function detectColumns(items: TextItem[]): {
  columnCount: 1 | 2 | 3;
  splitX: number | null;
} {
  if (items.length < 8) return { columnCount: 1, splitX: null };
  const maxX = Math.max(...items.map((i) => i.x + i.width), 1);
  const minX = Math.min(...items.map((i) => i.x));
  const width = maxX - minX;
  if (width < 200) return { columnCount: 1, splitX: null };

  const buckets = 20;
  const counts = new Array(buckets).fill(0);
  for (const item of items) {
    const idx = Math.min(
      buckets - 1,
      Math.floor(((item.x - minX) / width) * buckets),
    );
    counts[idx] += Math.max(1, item.str.trim().length);
  }

  let gapAt = -1;
  let gapScore = 0;
  for (let i = 6; i <= 14; i++) {
    const left = counts.slice(0, i).reduce((a, b) => a + b, 0);
    const right = counts.slice(i).reduce((a, b) => a + b, 0);
    const hole = counts[i] + (counts[i - 1] ?? 0) + (counts[i + 1] ?? 0);
    if (left > 40 && right > 40 && hole < Math.min(left, right) * 0.18) {
      const score = Math.min(left, right) / (hole + 1);
      if (score > gapScore) {
        gapScore = score;
        gapAt = i;
      }
    }
  }

  if (gapAt === -1 || gapScore < 8) return { columnCount: 1, splitX: null };
  return { columnCount: 2, splitX: minX + (gapAt / buckets) * width };
}

function itemsOverlap(a: TextItem, b: TextItem) {
  const overlap = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const minWidth = Math.min(Math.max(a.width, 8), Math.max(b.width, 8));
  return overlap > minWidth * 0.45 || Math.abs(a.x - b.x) < 14;
}

function joinLine(items: TextItem[]) {
  const deduped: TextItem[] = [];
  for (const item of items) {
    const text = collapseRepeatedPhrase(item.str.replace(/\s+/g, " ").trim());
    if (!text) continue;
    const prev = deduped[deduped.length - 1];
    if (prev && itemsOverlap(prev, item)) {
      const prevText = prev.str.toLowerCase();
      const nextText = text.toLowerCase();
      if (prevText === nextText) continue;
      if (nextText.includes(prevText) && text.length > prev.str.length) {
        deduped[deduped.length - 1] = { ...item, str: text };
        continue;
      }
      if (prevText.includes(nextText)) continue;
    }
    if (
      prev &&
      prev.str.replace(/\s+/g, " ").trim().toLowerCase() === text.toLowerCase()
    ) {
      continue;
    }
    deduped.push({ ...item, str: text });
  }
  return collapseRepeatedPhrase(
    deduped
      .map((i) => i.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

export function naukriReadOrder(items: TextItem[]): string {
  return uniqueConsecutiveLines(
    clusterLines(items)
      .map(joinLine)
      .filter(Boolean)
      .join("\n"),
  );
}

export function columnReadOrder(items: TextItem[], splitX: number): string {
  const left = items.filter((i) => i.x < splitX).sort((a, b) => b.y - a.y || a.x - b.x);
  const right = items.filter((i) => i.x >= splitX).sort((a, b) => b.y - a.y || a.x - b.x);
  return `${naukriReadOrder(left)}\n\n${naukriReadOrder(right)}`.trim();
}

export function findGarbledLines(
  items: TextItem[],
  splitX: number,
): { intended: string; parsed: string }[] {
  const garbled: { intended: string; parsed: string }[] = [];
  for (const line of clusterLines(items)) {
    const left = line.filter((i) => i.x < splitX);
    const right = line.filter((i) => i.x >= splitX);
    if (left.length && right.length) {
      const parsed = joinLine(line);
      const intended = `${joinLine(left)}   |   ${joinLine(right)}`;
      if (parsed !== joinLine(left) && parsed !== joinLine(right)) {
        garbled.push({ intended, parsed });
      }
    }
  }
  return garbled.slice(0, 12);
}

export function headerFooterText(items: TextItem[]): string[] {
  if (!items.length) return [];
  const maxY = Math.max(...items.map((i) => i.y));
  const minY = Math.min(...items.map((i) => i.y));
  const span = Math.max(1, maxY - minY);
  const headerCut = maxY - span * 0.08;
  const footerCut = minY + span * 0.08;
  const captured = items
    .filter((i) => i.y >= headerCut || i.y <= footerCut)
    .map((i) => i.str.trim())
    .filter(Boolean);
  return [...new Set(captured)].slice(0, 8);
}

export function analyzeLayout(params: {
  items: TextItem[];
  pageCount: number;
  hasImage: boolean;
  hasTable: boolean;
  fileBytes: number;
  fileName: string;
  fileType: LayoutAnalysis["fileType"];
  fallbackText?: string;
}): LayoutAnalysis {
  const { items } = params;
  const { columnCount, splitX } = detectColumns(items);
  const parserText =
    items.length > 0 ? naukriReadOrder(items) : (params.fallbackText ?? "").trim();
  const intendedText =
    items.length > 0 && splitX != null
      ? columnReadOrder(items, splitX)
      : parserText;
  const garbledLines =
    splitX != null ? findGarbledLines(items, splitX) : [];

  return {
    pageCount: params.pageCount,
    columnCount,
    hasImage: params.hasImage,
    hasTable: params.hasTable,
    fileBytes: params.fileBytes,
    fileName: params.fileName,
    fileType: params.fileType,
    intendedText,
    parserText,
    garbledLines,
    headerFooterText: headerFooterText(items),
    items,
  };
}

export function itemsFromPlainText(text: string): TextItem[] {
  const lines = text.replace(/\r/g, "").split("\n");
  const items: TextItem[] = [];
  let y = 800;
  for (const line of lines) {
    const parts = line.split(/\s{4,}|\t+/);
    if (parts.length >= 2 && parts[0].trim() && parts[1].trim()) {
      items.push({
        str: parts[0].trim(),
        x: 40,
        y,
        width: 220,
        height: 12,
        page: 1,
      });
      items.push({
        str: parts.slice(1).join(" ").trim(),
        x: 340,
        y,
        width: 200,
        height: 12,
        page: 1,
      });
    } else if (line.trim()) {
      items.push({
        str: line.trim(),
        x: 40,
        y,
        width: Math.min(500, line.trim().length * 6),
        height: 12,
        page: 1,
      });
    }
    y -= 16;
  }
  return items;
}
