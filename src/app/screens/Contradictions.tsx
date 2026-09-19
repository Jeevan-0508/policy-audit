import { useAuditStore } from '../lib/store';
import { EmptyState } from '../components/StatCard';
import { SeverityBadge } from '../components/Badge';

export function Contradictions() {
  const { result } = useAuditStore();

  if (!result) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold mb-6">Contradictions</h1>
        <EmptyState title="No contradictions yet" body="Run an audit to see where two documents make opposing claims about the same control." />
      </div>
    );
  }

  if (result.contradictions.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold mb-6">Contradictions</h1>
        <EmptyState title="No contradictions detected" body="The corpus did not contain any document pairs matching the conservative contradiction rules. This is a good sign, not a lack of analysis." />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-1">Contradictions</h1>
      <p className="text-sm text-fg-dim mb-6">{result.contradictions.length} detected. Every one requires cross-document topic overlap plus an opposing-scope signal &mdash; not just differing wording.</p>

      <div className="space-y-4">
        {result.contradictions.map((c) => (
          <div key={c.id} className="border border-line rounded-md bg-ink-800 p-4">
            <div className="flex items-center gap-2 mb-3">
              <SeverityBadge severity={c.severity} />
              <span className="mono text-2xs text-fg-mute">{c.topic}</span>
              <span className="mono text-2xs text-fg-mute">conf {Math.round(c.confidence * 100)}%</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-line rounded p-3">
                <div className="mono text-2xs text-fg-mute mb-1">
                  {c.documentA.documentName}
                  {c.documentA.page ? ` \u00b7 p.${c.documentA.page}` : ''}
                </div>
                <div className="text-sm">&ldquo;{c.documentA.statement}&rdquo;</div>
              </div>
              <div className="border border-line rounded p-3">
                <div className="mono text-2xs text-fg-mute mb-1">
                  {c.documentB.documentName}
                  {c.documentB.page ? ` \u00b7 p.${c.documentB.page}` : ''}
                </div>
                <div className="text-sm">&ldquo;{c.documentB.statement}&rdquo;</div>
              </div>
            </div>
            <p className="text-sm text-fg-dim mt-3">{c.conflictDescription}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
