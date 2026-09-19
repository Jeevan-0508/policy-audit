import { create } from 'zustand';
import type { AuditResult } from '@core/engine/audit';
import { runAudit } from '@core/engine/audit';
import { ingestFile, UnsupportedFileError, FileTooLargeError, type IngestResult } from '@core/parsers';
import { buildDemoFiles } from '@core/demo/corpus';
import type { FrameworkId } from '@core/types';

export interface UploadError {
  filename: string;
  message: string;
}

interface AuditStore {
  ingested: IngestResult[];
  uploadErrors: UploadError[];
  result: AuditResult | null;
  status: 'idle' | 'ingesting' | 'auditing' | 'done';
  selectedFrameworks: FrameworkId[] | undefined;
  addFiles: (files: FileList | File[]) => Promise<void>;
  removeDocument: (documentId: string) => void;
  runAuditNow: () => void;
  loadDemoCorpus: () => Promise<void>;
  reset: () => void;
  setSelectedFrameworks: (fw: FrameworkId[] | undefined) => void;
}

export const useAuditStore = create<AuditStore>((set, get) => ({
  ingested: [],
  uploadErrors: [],
  result: null,
  status: 'idle',
  selectedFrameworks: undefined,

  addFiles: async (files) => {
    set({ status: 'ingesting' });
    const list = Array.from(files);
    const nextIngested = [...get().ingested];
    const errors: UploadError[] = [];

    for (const file of list) {
      try {
        const res = await ingestFile(file);
        nextIngested.push(res);
      } catch (err) {
        const message =
          err instanceof UnsupportedFileError || err instanceof FileTooLargeError
            ? err.message
            : `Failed to parse ${file.name}: ${(err as Error).message}`;
        errors.push({ filename: file.name, message });
      }
    }

    set({ ingested: nextIngested, uploadErrors: errors, status: 'idle' });
  },

  removeDocument: (documentId) => {
    set({ ingested: get().ingested.filter((i) => i.document.id !== documentId), result: null, status: 'idle' });
  },

  runAuditNow: () => {
    const { ingested, selectedFrameworks } = get();
    if (ingested.length === 0) return;
    set({ status: 'auditing' });
    const result = runAudit(ingested, selectedFrameworks);
    set({ result, status: 'done' });
  },

  loadDemoCorpus: async () => {
    set({ ingested: [], uploadErrors: [], result: null, status: 'ingesting' });
    const files = buildDemoFiles();
    const ingested: IngestResult[] = [];
    for (const file of files) {
      ingested.push(await ingestFile(file));
    }
    set({ ingested, status: 'auditing' });
    const result = runAudit(ingested, get().selectedFrameworks);
    set({ result, status: 'done' });
  },

  reset: () => set({ ingested: [], uploadErrors: [], result: null, status: 'idle' }),

  setSelectedFrameworks: (fw) => set({ selectedFrameworks: fw }),
}));
