import { useState } from 'react';
import { useAuditStore } from '../lib/store';
import { EmptyState } from '../components/StatCard';
import { SeverityBadge, FindingTypeBadge } from '../components/Badge';
import type { Finding } from '@core/types';
import { RISK_WEIGHTS } from '@core/engine/severity';

function FindingDetail({ finding, onClose }: { finding: Finding; onClose: () => void }) {
  const { result } = useAuditStore();
  const evidenceById = new Map(result?.evidence.map((e) => [e.id, e]) ?? []);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div className="bg-ink-800 border border-line rounded-md max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <div className="mono text-2xs text-fg-mute">{finding.id}</div>
          <button className="text-fg-mute hover:text-fg" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <FindingTypeBadge type={finding.type} />
          <SeverityBadge severity={finding.severity} />
        </div>
        <h2 className="text-lg font-medium mb-4">{finding.title}</h2>

        <div className="text-2xs uppercase text-fg-mute mono mb-1">Reasoning</div>
        <p className="text-sm text-fg mb-4">{finding.reasoning}</p>

        {finding.evidenceIds.length > 0 && (
          <>
            <div className="text-2xs uppercase text-fg-mute mono mb-1">Evidence Found</div>
            <div className="space-y-2 mb-4">
              {finding.evidenceIds.slice(0, 5).map((id) => {
                const ev = evidenceById.get(id);
                if (!ev) return null;
                return (
                  <div key={id} className="border border-line rounded p-2 text-sm">
                    <div className="mono text-2xs text-fg-mute mb-1">
                      {ev.documentName}
                      {ev.page ? ` \u00b7 p.${ev.page}` : ''}
                      {ev.section ? ` \u00b7 ${ev.section}` : ''}
                    </div>
                    &ldquo;{ev.keyStatement}&rdquo;
                  </div>
                );
              })}
            </div>
          </>
        )}

        {finding.missingElements.length > 0 && (
          <>
            <div className="text-2xs uppercase text-fg-mute mono mb-1">Missing</div>
            <ul className="text-sm mb-4 space-y-1">
              {finding.missingElements.map((m, i) => (
                <li key={i} className="text-missing">
                  &#10007; {m}
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="text-2xs uppercase text-fg-mute mono mb-1">Recommended Remediation</div>
        <p className="text-sm text-fg mb-4">{finding.remediation}</p>

        <div className="grid grid-cols-2 gap-3 text-sm border-t border-line pt-4">
          <div>
            <div className="text-2xs uppercase text-fg-mute mono">Confidence</div>
            <div>{Math.round(finding.confidence * 100)}%</div>
          </div>
          <div>
            <div className="text-2xs uppercase text-fg-mute mono">Risk Score</div>
            <div>
              {finding.riskScore} / 100{' '}
              <span className="text-2xs text-fg-mute">
                (weights: severity {RISK_WEIGHTS.severity}, criticality {RISK_WEIGHTS.controlCriticality}, impact {RISK_WEIGHTS.impact})
              </span>
            </div>
          </div>
          <div>
            <div className="text-2xs uppercase text-fg-mute mono">Frameworks</div>
            <div>{finding.frameworkIds.join(', ') || '—'}</div>
          </div>
          <div>
            <div className="text-2xs uppercase text-fg-mute mono">Requirements</div>
            <div className="mono text-2xs">{finding.requirementIds.join(', ') || '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Findings() {
  const { result } = useAuditStore();
  const [selected, setSelected] = useState<Finding | null>(null);

  if (!result) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold mb-6">Findings</h1>
        <EmptyState title="No findings yet" body="Run an audit to see missing, partial, conflicting and implementation-gap findings, each traceable to source evidence." />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-1">Findings</h1>
      <p className="text-sm text-fg-dim mb-6">{result.findings.length} findings, sorted by risk score. Click a row for full evidence and remediation.</p>

      <div className="border border-line rounded-md bg-ink-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-fg-mute text-2xs border-b border-line">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Severity</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Risk</th>
            </tr>
          </thead>
          <tbody>
            {result.findings.map((f) => (
              <tr key={f.id} className="border-b border-line/50 cursor-pointer hover:bg-ink-700/60" onClick={() => setSelected(f)}>
                <td className="px-4 py-2 mono text-2xs text-fg-mute">{f.id}</td>
                <td className="px-4 py-2">
                  <SeverityBadge severity={f.severity} />
                </td>
                <td className="px-4 py-2">{f.title}</td>
                <td className="px-4 py-2">
                  <FindingTypeBadge type={f.type} />
                </td>
                <td className="px-4 py-2 mono text-2xs">{f.riskScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <FindingDetail finding={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
