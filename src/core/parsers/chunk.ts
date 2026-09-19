import type { EvidenceChunk } from '../types';
import { nextId } from '../engine/ids';

const HEADING_PATTERNS: RegExp[] = [
  /^#{1,6}\s+(.+)$/, // markdown heading
  /^(\d+(?:\.\d+)*)\s+([A-Z][A-Za-z0-9 ,&/'-]{2,80})$/, // "4.2 Human Oversight Process"
  /^(SECTION|Section)\s+\d+[:.]?\s*(.+)$/,
  /^([A-Z][A-Z0-9 ,&/'-]{3,60})$/, // ALL CAPS TITLE line
];

export function looksLikeHeading(line: string): string | null {
  const trimmed = line.trim();
  if (trimmed.length < 3 || trimmed.length > 90) return null;
  for (const pattern of HEADING_PATTERNS) {
    const m = trimmed.match(pattern);
    if (m) return trimmed.replace(/^#{1,6}\s+/, '');
  }
  return null;
}

interface ChunkParagraphsOptions {
  documentId: string;
  documentName: string;
  page?: number;
  baseConfidence?: number;
}

/** Splits raw extracted text into paragraph-level EvidenceChunks, tracking
 * the nearest preceding heading as `section` for provenance. */
export function chunkParagraphs(rawText: string, opts: ChunkParagraphsOptions): EvidenceChunk[] {
  const lines = rawText.split(/\r?\n/);
  const chunks: EvidenceChunk[] = [];
  let currentSection: string | undefined;
  let buffer: string[] = [];
  let paragraphIndex = 0;

  const flush = () => {
    const text = buffer.join(' ').replace(/\s+/g, ' ').trim();
    buffer = [];
    if (text.length < 20) return; // skip noise/short fragments
    paragraphIndex += 1;
    chunks.push({
      id: nextId('CH'),
      documentId: opts.documentId,
      documentName: opts.documentName,
      page: opts.page,
      section: currentSection,
      paragraphRef: `p${paragraphIndex}`,
      text,
      extractionConfidence: opts.baseConfidence ?? 0.92,
      extractedAt: new Date().toISOString(),
    });
  };

  for (const line of lines) {
    const heading = looksLikeHeading(line);
    if (heading) {
      flush();
      currentSection = heading;
      continue;
    }
    if (line.trim() === '') {
      flush();
      continue;
    }
    buffer.push(line.trim());
  }
  flush();
  return chunks;
}
