import * as pdfjsLib from 'pdfjs-dist';
import type { EvidenceChunk } from '../types';
import { chunkParagraphs } from './chunk';

let workerConfigured = false;
function ensureWorker(): void {
  if (workerConfigured) return;
  const base = import.meta.env.BASE_URL ?? '/';
  pdfjsLib.GlobalWorkerOptions.workerSrc = `${base}vendor/pdf.worker.min.mjs`;
  workerConfigured = true;
}

export async function parsePdfFile(file: File, documentId: string): Promise<{ chunks: EvidenceChunk[]; pageCount: number }> {
  ensureWorker();
  const buf = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buf }).promise;
  const allChunks: EvidenceChunk[] = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    // pdf.js gives per-glyph-run items; rebuild lines using their vertical
    // position so headings/paragraphs are recoverable as line breaks.
    let lastY: number | null = null;
    let lineText = '';
    const lines: string[] = [];
    for (const item of content.items as { str: string; transform: number[] }[]) {
      const y = item.transform[5];
      if (lastY !== null && Math.abs(y - lastY) > 2) {
        lines.push(lineText);
        lineText = item.str;
      } else {
        lineText += (lineText ? ' ' : '') + item.str;
      }
      lastY = y;
    }
    if (lineText) lines.push(lineText);

    const pageChunks = chunkParagraphs(lines.join('\n'), {
      documentId,
      documentName: file.name,
      page: pageNum,
      baseConfidence: 0.9,
    });
    allChunks.push(...pageChunks);
  }

  return { chunks: allChunks, pageCount: doc.numPages };
}
