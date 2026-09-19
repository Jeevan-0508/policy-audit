import type { EvidenceChunk } from '../types';
import { chunkParagraphs } from './chunk';

export async function parseTextFile(file: File, documentId: string): Promise<EvidenceChunk[]> {
  const raw = await file.text();
  return chunkParagraphs(raw, { documentId, documentName: file.name, baseConfidence: 0.97 });
}
