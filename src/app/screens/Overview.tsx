import { Link } from 'react-router-dom';
import { useAuditStore } from '../lib/store';
import { StatCard, EmptyState } from '../components/StatCard';
import { FRAMEWORK_META } from '@core/frameworks';

export function Overview() {
  const { result, ingested, loadDemoCorpus, status } = useAuditStore();

  if (!result) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold mb-1">Overview</h1>
        <p className="text-sm text-fg-dim mb-6">Upload the evidence. Find what your AI governance is missing.</p>
        <EmptyState
          title={ingested.length > 0 ? `${ingested.length} document(s) staged, audit not run yet` : 'No audit run yet'}
          body="Upload AI governance policies, architecture docs, SOPs, or agent config, then run the audit to see requirement coverage, findings, contradictions and gaps traced back to exact source evidence."
          action={
            <div className="flex items-center gap-3">
              <Link to="/upload" className="mono text-sm px-4 py-2 rounded border border-accent text-accent hover:bg-accent/10">
                Upload Documents
              </Link>
              <button
                className="mono text-sm px-4 py-2 rounded border border-line text-fg-dim hover:border-accent/60 hover:text-fg disabled:opacity-40"
                disabled={status === 'ingesting' || status === 'auditing'}
                onClick={() => void loadDemoCorpus()}
              >
                Load Demo Corpus
              </button>
            </div>
          }
        />
      </div>
    );
  }

  const { stats } = result.run;

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-1">Overview</h1>
      <p className="text-sm text-fg-dim mb-6">Evidence coverage, not a compliance score. See Methodology on the Findings screen.</p>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatCard label="Documents Analyzed" value={stats.documentsAnalyzed} />
        <StatCard label="Requirements Evaluated" value={stats.requirementsEvaluated} />
        <StatCard label="Evidence Items" value={stats.evidenceItems} />
        <StatCard label="Findings" value={stats.findings} sub={`${stats.criticalFindings} critical, ${stats.highFindings} high`} />
        <StatCard label="Contradictions" value={stats.contradictions} />
        <StatCard label="Implementation Gaps" value={stats.implementationGaps} />
        <StatCard label="Agent Profiles" value={result.agentProfiles.length} />
        <StatCard label="Frameworks" value={result.run.frameworkIds.length} />
      </div>

      <div className="border border-line rounded-md bg-ink-800 p-5 mb-6">
        <h2 className="text-sm font-medium mb-4">Framework Coverage (Evidence)</h2>
        <div className="space-y-3">
          {result.coverage.map((c) => (
            <div key={c.framework} className="flex items-center gap-3">
              <div className="w-40 text-sm text-fg-dim shrink-0">{FRAMEWORK_META[c.framework].shortName}</div>
              <div className="flex-1 h-3 rounded-full overflow-hidden flex bg-ink-600">
                <div className="bg-support h-full" style={{ width: `${c.supportedPct}%` }} />
                <div className="bg-partial h-full" style={{ width: `${c.partialPct}%` }} />
                <div className="bg-missing h-full" style={{ width: `${c.missingPct}%` }} />
              </div>
              <div className="w-14 text-right mono text-2xs text-fg-dim">{c.supportedPct}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-line rounded-md bg-ink-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium">Top Findings</h2>
          <Link to="/findings" className="text-2xs text-accent mono">
            VIEW ALL &rarr;
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-fg-mute text-2xs border-b border-line">
              <th className="pb-2">ID</th>
              <th className="pb-2">Title</th>
              <th className="pb-2">Severity</th>
              <th className="pb-2">Risk Score</th>
            </tr>
          </thead>
          <tbody>
            {result.findings.slice(0, 8).map((f) => (
              <tr key={f.id} className="border-b border-line/50">
                <td className="py-2 mono text-2xs text-fg-mute">{f.id}</td>
                <td className="py-2">{f.title}</td>
                <td className="py-2 mono text-2xs">{f.severity}</td>
                <td className="py-2 mono text-2xs">{f.riskScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
