import { useState } from 'react';
import { useAuditStore } from '../lib/store';
import { EmptyState } from '../components/StatCard';

export function Evidence() {
  const { result } = useAuditStore();
  const [filter, setFilter] = useState('');

  if (!result) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold mb-6">Evidence</h1>
        <EmptyState title="No evidence yet" body="Run an audit to see every extracted, classified evidence statement with full provenance." />
      </div>
    );
  }

  const filtered = result.evidence.filter(
    (e) => !filter || e.text.toLowerCase().includes(filter.toLowerCase()) || e.controlIds.some((c) => c.includes(filter.toLowerCase()))
  );

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-1">Evidence</h1>
      <p className="text-sm text-fg-dim mb-4">{result.evidence.length} extracted statements, each traceable to a document, page and section.</p>
      <input
        className="mono text-sm bg-ink-800 border border-line rounded px-3 py-2 mb-4 w-full max-w-md"
        placeholder="Filter by text or control id..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className="space-y-2">
        {filtered.slice(0, 200).map((e) => (
          <div key={e.id} className="border border-line rounded-md bg-ink-800 p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="mono text-2xs text-fg-mute">
                {e.id} &middot; {e.documentName}
                {e.page ? ` \u00b7 p.${e.page}` : ''}
                {e.section ? ` \u00b7 ${e.section}` : ''}
              </div>
              <div className="mono text-2xs text-fg-mute">conf {(e.confidence * 100).toFixed(0)}%</div>
            </div>
            <div className="text-sm text-fg">&ldquo;{e.keyStatement}&rdquo;</div>
            <div className="flex gap-1 mt-2 flex-wrap">
              <span className="mono text-2xs px-1.5 py-0.5 rounded bg-ink-600 text-fg-dim">{e.evidenceType}</span>
              {e.controlIds.map((c) => (
                <span key={c} className="mono text-2xs px-1.5 py-0.5 rounded bg-ink-600 text-accent">
                  {c}
                </span>
              ))}
              <span className="mono text-2xs px-1.5 py-0.5 rounded bg-ink-600 text-fg-dim">{e.polarity}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
