import { Link } from 'react-router-dom';
import { useAuditStore } from '../lib/store';
import { StatCard, EmptyState } from '../components/StatCard';
import { FRAMEWORK_META } from '@core/frameworks';

const OLYMPUS_STAGES = [
  { key: 'GOVERN', label: 'Govern', detail: 'Policy + framework' },
  { key: 'DETECT', label: 'Detect', detail: 'Evidence + gaps' },
  { key: 'DECIDE', label: 'Decide', detail: 'Risk prioritisation' },
  { key: 'VERIFY', label: 'Verify', detail: 'Source traceability' },
  { key: 'AUDIT', label: 'Audit', detail: 'Run recorded' },
] as const;

function formatRunTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

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
  const highImpactFindings = result.findings.filter((finding) => finding.severity === 'CRITICAL' || finding.severity === 'HIGH').length;
  const queue = [
    { label: 'Critical / high findings', value: highImpactFindings, detail: 'Review risk and evidence', href: '/findings', tone: 'text-critical' },
    { label: 'Contradictions', value: stats.contradictions, detail: 'Resolve policy conflicts', href: '/contradictions', tone: 'text-conflict' },
    { label: 'Implementation gaps', value: stats.implementationGaps, detail: 'Assign control owners', href: '/findings', tone: 'text-partial' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-semibold">Overview</h1>
            <span className="mono text-2xs uppercase px-2 py-0.5 rounded border border-support/50 text-support">Olympus run complete</span>
          </div>
          <p className="text-sm text-fg-dim">Evidence coverage, not a compliance score. See Methodology on the Findings screen.</p>
        </div>
        <div className="text-right shrink-0">
          <div className="mono text-2xs uppercase text-fg-mute">{result.run.id}</div>
          <div className="text-2xs text-fg-dim mt-1">Completed {formatRunTime(result.run.completedAt)}</div>
        </div>
      </div>

      <section className="border border-accent/35 rounded-md bg-accent/[0.04] p-5 mb-6" aria-labelledby="olympus-trace-title">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="mono text-2xs uppercase text-accent tracking-wide mb-1">Olympus control trace</div>
            <h2 id="olympus-trace-title" className="text-sm font-medium">One evidence-backed path from policy to audit record</h2>
          </div>
          <button
            className="mono text-2xs uppercase px-3 py-1.5 rounded border border-line-bright text-fg-dim hover:border-accent/60 hover:text-accent disabled:opacity-40"
            disabled={status === 'ingesting' || status === 'auditing'}
            onClick={() => void loadDemoCorpus()}
          >
            Re-run demo
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {OLYMPUS_STAGES.map((stage, index) => (
            <div key={stage.key} className="relative">
              {index < OLYMPUS_STAGES.length - 1 && <div className="absolute left-[calc(50%+18px)] right-[-10px] top-3 border-t border-accent/35" aria-hidden="true" />}
              <div className="relative flex flex-col items-center text-center">
                <div className="w-6 h-6 rounded-full border border-accent bg-ink-900 text-accent flex items-center justify-center mono text-2xs">{index + 1}</div>
                <div className="mono text-2xs uppercase text-fg mt-2">{stage.label}</div>
                <div className="text-2xs text-fg-mute mt-1">{stage.detail}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 pt-4 border-t border-accent/15 text-2xs text-fg-dim">
          <span><span className="text-accent">●</span> {stats.evidenceItems} evidence items linked</span>
          <span><span className="text-accent">●</span> {stats.findings} findings emitted</span>
          <span><span className="text-accent">●</span> {result.run.frameworkIds.length} frameworks evaluated</span>
        </div>
      </section>

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

      <section className="mb-6" aria-labelledby="remediation-queue-title">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="mono text-2xs uppercase text-fg-mute tracking-wide">Operator queue</div>
            <h2 id="remediation-queue-title" className="text-sm font-medium mt-1">Where to act next</h2>
          </div>
          <Link to="/findings" className="text-2xs text-accent mono">OPEN FINDINGS &rarr;</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {queue.map((item) => (
            <Link key={item.label} to={item.href} className="border border-line rounded-md bg-ink-800 px-4 py-3 hover:border-line-bright hover:bg-ink-700/60 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm text-fg">{item.label}</div>
                <div className={`text-xl font-semibold mono ${item.tone}`}>{item.value}</div>
              </div>
              <div className="text-2xs text-fg-mute mt-2">{item.detail} <span className="text-accent">&rarr;</span></div>
            </Link>
          ))}
        </div>
      </section>

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
