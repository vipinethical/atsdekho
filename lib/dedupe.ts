export function collapseRepeatedPhrase(text: string): string {
  let current = text.replace(/\s+/g, " ").trim();
  if (!current) return "";

  for (let guard = 0; guard < 8; guard++) {
    const next = collapseAdjacentRepeats(current);
    if (next === current) break;
    current = next;
  }
  return current;
}

function collapseAdjacentRepeats(text: string): string {
  const words = text.split(" ");
  if (words.length < 2) return text;

  for (let n = Math.floor(words.length / 2); n >= 1; n--) {
    for (let i = 0; i + 2 * n <= words.length; i++) {
      const left = words.slice(i, i + n).join(" ");
      const right = words.slice(i + n, i + 2 * n).join(" ");
      if (left.toLowerCase() === right.toLowerCase()) {
        return [...words.slice(0, i + n), ...words.slice(i + 2 * n)].join(" ").trim();
      }
    }
  }
  return text;
}

export function sameText(a: string, b: string): boolean {
  return (
    a.replace(/\s+/g, " ").trim().toLowerCase() ===
    b.replace(/\s+/g, " ").trim().toLowerCase()
  );
}

export function uniqueConsecutiveLines(text: string): string {
  const out: string[] = [];
  for (const raw of text.split("\n")) {
    const line = collapseRepeatedPhrase(raw);
    if (!line) {
      if (out.at(-1) !== "") out.push("");
      continue;
    }
    const prev = [...out].reverse().find((item) => item);
    if (prev && sameText(prev, line)) continue;
    out.push(line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function uniqueConsecutive(lines: string[]): string[] {
  const out: string[] = [];
  for (const raw of lines) {
    const line = collapseRepeatedPhrase(raw);
    if (!line) continue;
    if (out.at(-1) && sameText(out.at(-1) ?? "", line)) continue;
    out.push(line);
  }
  return out;
}

export function uniqueLines(lines: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of lines) {
    const line = collapseRepeatedPhrase(raw);
    if (!line) continue;
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    if (out.at(-1) && sameText(out.at(-1) ?? "", line)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}
