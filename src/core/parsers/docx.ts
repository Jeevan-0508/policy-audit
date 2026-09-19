import * as mammoth from 'mammoth';
import type { EvidenceChunk } from '../types';
import { chunkParagraphs } from './chunk';

export async function parseDocxFile(file: File, documentId: string): Promise<EvidenceChunk[]> {
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return chunkParagraphs(result.value, { documentId, documentName: file.name, baseConfidence: 0.93 });
}
