import type { EvidenceChunk } from '../types';
import { nextId } from '../engine/ids';

/** Each populated row on each sheet becomes one evidence chunk with
 * `sheet + row` provenance — the same shape as the CSV parser, so an
 * XLSX evidence register behaves identically regardless of format. */
export async function parseXlsxFile(file: File, documentId: string): Promise<EvidenceChunk[]> {
  const XLSX = await import('xlsx');
  const buf = await file.arrayBuffer();
  const workbook = XLSX.read(buf, { type: 'array' });
  const chunks: EvidenceChunk[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
    rows.forEach((row, idx) => {
      const entries = Object.entries(row).filter(([, v]) => String(v).trim() !== '');
      if (entries.length === 0) return;
      const text = entries.map(([k, v]) => `${k}: ${v}`).join(' | ');
      chunks.push({
        id: nextId('CH'),
        documentId,
        documentName: file.name,
        section: sheetName,
        paragraphRef: `row ${idx + 2}`,
        text,
        extractionConfidence: 0.98,
        extractedAt: new Date().toISOString(),
      });
    });
  }
  return chunks;
}
