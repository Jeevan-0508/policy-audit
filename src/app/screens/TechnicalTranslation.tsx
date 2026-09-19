import { useState } from 'react';
import { ALL_REQUIREMENTS, CONTROLS, FRAMEWORK_META } from '@core/frameworks';
import type { FrameworkId } from '@core/types';

function ChainStep({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2 border-b border-line/50 last:border-b-0">
      <div className="w-36 shrink-0 text-2xs uppercase tracking-wide text-fg-mute mono pt-0.5">{label}</div>
      <div className="text-sm flex-1">{children}</div>
    </div>
  );
}

function ExpectationList({ items }: { items: string[] }) {
  if (items.length === 0) return <span className="text-fg-mute text-2xs">none specified</span>;
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-fg-dim">&bull; {item}</li>
      ))}
    </ul>
  );
}

export function TechnicalTranslation() {
  const [frameworkFilter, setFrameworkFilter] = useState<string>('all');
  const [query, setQuery] = useState('');

  const filtered = ALL_REQUIREMENTS.filter((r) => {
    if (frameworkFilter !== 'all' && r.framework !== frameworkFilter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.reference.toLowerCase().includes(q) ||
      r.domain.toLowerCase().includes(q) ||
      r.controlIds.some((c) => CONTROLS[c].name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-1">Technical Translation</h1>
      <p className="text-sm text-fg-dim mb-4 max-w-3xl">
        The full translation chain for every requirement in the knowledge base: Regulation &rarr; Control
        &rarr; Technical Expectation &rarr; Validation Method (Expected Evidence). This is the same crosswalk
        the audit engine matches evidence against, shown here as a static reference independent of any run.
      </p>

      <div className="flex items-center gap-3 mb-4">
        <select
          className="mono text-sm bg-ink-800 border border-line rounded px-3 py-2"
          value={frameworkFilter}
          onChange={(e) => setFrameworkFilter(e.target.value)}
        >
          <option value="all">All frameworks</option>
          {Object.values(FRAMEWORK_META).map((fw) => (
            <option key={fw.id} value={fw.id}>{fw.shortName}</option>
          ))}
        </select>
        <input
          className="text-sm bg-ink-800 border border-line rounded px-3 py-2 flex-1 max-w-sm"
          placeholder="Filter by title, reference, domain or control..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="text-2xs text-fg-mute mono">{filtered.length} of {ALL_REQUIREMENTS.length}</div>
      </div>

      <div className="space-y-3">
        {filtered.map((r) => (
          <details key={r.id} className="border border-line rounded-md bg-ink-800 group">
            <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="mono text-2xs text-fg-mute shrink-0">{r.id}</span>
                <span className="mono text-2xs text-accent shrink-0">{FRAMEWORK_META[r.framework as FrameworkId].shortName}</span>
                <span className="truncate">{r.title}</span>
              </div>
              <span className="text-fg-mute text-2xs mono shrink-0 group-open:rotate-90 transition-transform">&rarr;</span>
            </summary>
            <div className="px-4 pb-4">
              <ChainStep label="Regulation">
                {r.reference}
                <span className="text-fg-mute"> &mdash; {r.domain}</span>
              </ChainStep>
              <ChainStep label="Applicability">{r.applicability}</ChainStep>
              <ChainStep label="Control">
                {r.controlIds.map((c) => (
                  <span key={c} className="inline-block mr-2 mb-1 mono text-2xs px-2 py-0.5 rounded border border-line-bright text-fg-dim">
                    {CONTROLS[c].name}
                  </span>
                ))}
              </ChainStep>
              <ChainStep label="Control Objective">{r.controlObjective}</ChainStep>
              <ChainStep label="Technical Expectation">
                <ExpectationList items={r.technicalExpectations} />
              </ChainStep>
              <ChainStep label="Organizational Expectation">
                <ExpectationList items={r.organizationalExpectations} />
              </ChainStep>
              <ChainStep label="Validation Method">
                <ExpectationList items={r.expectedEvidence} />
              </ChainStep>
              {r.relatedRequirementIds.length > 0 && (
                <ChainStep label="Related Requirements">
                  <span className="mono text-2xs text-fg-mute">{r.relatedRequirementIds.join(', ')}</span>
                </ChainStep>
              )}
            </div>
          </details>
        ))}
        {filtered.length === 0 && (
          <div className="text-sm text-fg-mute py-8 text-center">No requirements match this filter.</div>
        )}
      </div>
    </div>
  );
}
