import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditStore } from '../lib/store';

export function Upload() {
  const { ingested, uploadErrors, status, addFiles, removeDocument, runAuditNow } = useAuditStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-semibold mb-1">Upload Documents</h1>
      <p className="text-sm text-fg-dim mb-6">
        PDF, DOCX, XLSX, CSV, TXT, MD, JSON, YAML. Parsing happens in your browser &mdash; nothing is
        uploaded anywhere unless you explicitly enable an optional LLM provider (not yet wired in this build).
      </p>

      <div
        className="border border-dashed border-line rounded-md py-12 flex flex-col items-center gap-3 cursor-pointer hover:border-accent/60"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) void addFiles(e.dataTransfer.files);
        }}
      >
        <div className="text-fg">Drop files here, or click to browse</div>
        <div className="text-2xs text-fg-mute mono">Max 25MB per file &middot; up to 40 files</div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.docx,.xlsx,.xls,.csv,.txt,.md,.json,.yaml,.yml"
          onChange={(e) => {
            if (e.target.files) void addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {status === 'ingesting' && <p className="text-sm text-accent mt-4">Parsing documents...</p>}

      {uploadErrors.length > 0 && (
        <div className="mt-4 border border-critical/40 bg-critical/10 rounded-md p-3">
          {uploadErrors.map((e, i) => (
            <div key={i} className="text-sm text-critical">
              {e.filename}: {e.message}
            </div>
          ))}
        </div>
      )}

      {ingested.length > 0 && (
        <div className="mt-6 border border-line rounded-md bg-ink-800 divide-y divide-line">
          {ingested.map((i) => (
            <div key={i.document.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm">{i.document.filename}</div>
                <div className="text-2xs text-fg-mute mono">
                  {i.document.fileType.toUpperCase()} &middot; {i.chunks.length} chunks
                  {i.document.pageCount ? ` \u00b7 ${i.document.pageCount} pages` : ''}
                  {i.document.injectionFlags.length > 0 && (
                    <span className="text-partial"> &middot; {i.document.injectionFlags.length} instruction-like span(s) flagged</span>
                  )}
                </div>
              </div>
              <button className="text-2xs text-fg-mute hover:text-critical" onClick={() => removeDocument(i.document.id)}>
                REMOVE
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        className="mt-6 mono text-sm px-5 py-2.5 rounded border border-accent text-accent hover:bg-accent/10 disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={ingested.length === 0}
        onClick={() => {
          runAuditNow();
          navigate('/');
        }}
      >
        RUN AUDIT
      </button>
    </div>
  );
}
