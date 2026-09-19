import type { EvidenceChunk, GovDocument, SupportedFileType } from '../types';
import { fnv1aHash, nextId } from '../engine/ids';
import { scanForInjection } from '../security/injection';
import { parseTextFile } from './text';
import { parseJsonFile, parseYamlFile } from './structured';
import { parseCsvFile } from './csv';
import { parseXlsxFile } from './xlsx';
import { parsePdfFile } from './pdf';
import { parseDocxFile } from './docx';

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB per file — section 27 size limit
export const MAX_FILES_PER_UPLOAD = 40;

const EXT_TO_TYPE: Record<string, SupportedFileType> = {
  pdf: 'pdf', docx: 'docx', xlsx: 'xlsx', xls: 'xlsx', csv: 'csv',
  txt: 'txt', md: 'md', markdown: 'md', json: 'json', yaml: 'yaml', yml: 'yaml',
};

export function detectFileType(filename: string): SupportedFileType | null {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return EXT_TO_TYPE[ext] ?? null;
}

export interface IngestResult {
  document: GovDocument;
  chunks: EvidenceChunk[];
}

export class UnsupportedFileError extends Error {}
export class FileTooLargeError extends Error {}

/** Single entry point for turning a File into provenance-carrying chunks.
 * Every chunk gets injection-scanned before it is handed to the
 * classification layer (spec section 27 — documents are untrusted input). */
export async function ingestFile(file: File): Promise<IngestResult> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new FileTooLargeError(`${file.name} exceeds the ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB per-file limit`);
  }
  const fileType = detectFileType(file.name);
  if (!fileType) {
    throw new UnsupportedFileError(`${file.name}: unsupported file type. Supported: PDF, DOCX, XLSX, CSV, TXT, MD, JSON, YAML`);
  }

  const documentId = nextId('DOC');
  const hashSource = await file.slice(0, Math.min(file.size, 1_000_000)).text().catch(() => file.name + file.size);
  const hash = fnv1aHash(hashSource + file.size);

  let chunks: EvidenceChunk[] = [];
  let pageCount: number | undefined;

  switch (fileType) {
    case 'pdf': {
      const res = await parsePdfFile(file, documentId);
      chunks = res.chunks;
      pageCount = res.pageCount;
      break;
    }
    case 'docx':
      chunks = await parseDocxFile(file, documentId);
      break;
    case 'xlsx':
      chunks = await parseXlsxFile(file, documentId);
      break;
    case 'csv':
      chunks = await parseCsvFile(file, documentId);
      break;
    case 'json':
      chunks = await parseJsonFile(file, documentId);
      break;
    case 'yaml':
      chunks = await parseYamlFile(file, documentId);
      break;
    case 'txt':
    case 'md':
      chunks = await parseTextFile(file, documentId);
      break;
  }

  const injectionFlags = chunks.flatMap((c) => scanForInjection(c.text, c.page));

  const document: GovDocument = {
    id: documentId,
    filename: file.name,
    fileType,
    sizeBytes: file.size,
    hash,
    uploadedAt: new Date().toISOString(),
    pageCount,
    injectionFlags,
  };

  return { document, chunks };
}
