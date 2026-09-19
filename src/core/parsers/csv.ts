import type { EvidenceChunk } from '../types';
import { nextId } from '../engine/ids';

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else cur += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      cells.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

/** Each CSV row becomes one evidence chunk, rendered as `header: value`
 * pairs so an evidence register or a suspect/control tracker keeps its
 * row-level provenance (`row 14`) instead of collapsing into raw text. */
export async function parseCsvFile(file: File, documentId: string): Promise<EvidenceChunk[]> {
  const raw = await file.text();
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]);
  const chunks: EvidenceChunk[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    if (cells.every((c) => c === '')) continue;
    const text = headers.map((h, idx) => `${h}: ${cells[idx] ?? ''}`).join(' | ');
    chunks.push({
      id: nextId('CH'),
      documentId,
      documentName: file.name,
      section: 'CSV Row',
      paragraphRef: `row ${i + 1}`,
      text,
      extractionConfidence: 0.99,
      extractedAt: new Date().toISOString(),
    });
  }
  return chunks;
}
