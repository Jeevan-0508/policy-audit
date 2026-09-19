import { useState } from 'react';
import { ALL_REQUIREMENTS } from '@core/frameworks';
import { useAuditStore } from '../lib/store';
import { StatusBadge } from '../components/Badge';

export function Requirements() {
  const { result } = useAuditStore();
  const [frameworkFilter, setFrameworkFilter] = useState<string>('all');

  const statusByReqId = new Map<string, string>();
  if (result) {
    for (const f of result.findings) {
      for (const id of f.requirementIds) statusByReqId.set(id, f.status);
    }
  }

  const filtered = ALL_REQUIREMENTS.filter((r) => frameworkFilter === 'all' || r.framework === frameworkFilter);

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-1">Requirements</h1>
      <p className="text-sm text-fg-dim mb-4">{ALL_REQUIREMENTS.length} normalized requirements across 6 frameworks. Curated, paraphrased seed set &mdash; not exhaustive legal text.</p>

      <select
        className="mono text-sm bg-ink-800 border border-line rounded px-3 py-2 mb-4"
        value={frameworkFilter}
        onChange={(e) => setFrameworkFilter(e.target.value)}
      >
        <option value="all">All frameworks</option>
        <option value="eu-ai-act">EU AI Act</option>
        <option value="iso-42001">ISO 42001</option>
        <option value="iso-23894">ISO 23894</option>
        <option value="nist-ai-rmf">NIST AI RMF</option>
        <option value="ai-security">AI Security</option>
        <option value="agent-governance">Agent Governance</option>
      </select>

      <div className="border border-line rounded-md bg-ink-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-fg-mute text-2xs border-b border-line">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Reference</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Domain</th>
              {result && <th className="px-4 py-2">Status</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-line/50">
                <td className="px-4 py-2 mono text-2xs text-fg-mute">{r.id}</td>
                <td className="px-4 py-2 mono text-2xs">{r.reference}</td>
                <td className="px-4 py-2">{r.title}</td>
                <td className="px-4 py-2 text-fg-dim">{r.domain}</td>
                {result && (
                  <td className="px-4 py-2">
                    {statusByReqId.has(r.id) ? (
                      <StatusBadge status={statusByReqId.get(r.id) as never} />
                    ) : (
                      <StatusBadge status={'SUPPORTED' as never} />
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
