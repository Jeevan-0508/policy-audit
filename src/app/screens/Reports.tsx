import { useAuditStore } from '../lib/store';
import { EmptyState } from '../components/StatCard';
import { FRAMEWORK_META, CONTROLS } from '@core/frameworks';

const SEVERITY_CLASS: Record<string, string> = {
  CRITICAL: 'severity-critical',
  HIGH: 'severity-high',
  MEDIUM: '',
  LOW: '',
  INFORMATIONAL: '',
};

export function Reports() {
  const { result } = useAuditStore();

  if (!result) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold mb-6">Audit Report</h1>
        <EmptyState
          title="No audit run yet"
          body="Run an audit first (Upload Documents, or Load Demo Corpus) to generate an exportable report."
        />
      </div>
    );
  }

  const { run, coverage, findings, contradictions, agentProfiles } = result;
  const docsById = new Map(result.documents.map((d) => [d.id, d]));

  return (
    <div className="p-8 print-page max-w-4xl">
      <div className="flex items-center justify-between mb-1 no-print">
        <h1 className="text-xl font-semibold">Audit Report</h1>
        <button
          className="mono text-2xs px-4 py-2 rounded border border-accent text-accent hover:bg-accent/10"
          onClick={() => window.print()}
        >
          PRINT / EXPORT PDF
        </button>
      </div>
      <p className="text-sm text-fg-dim mb-6 no-print">
        Browser print-to-PDF, no server round trip. Everything below is exactly what the app computed;
        nothing is reformatted for the report.
      </p>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">POLICY//AUDIT &mdash; Evidence Audit Report</h2>
        <div className="text-sm text-fg-dim">
          Run {run.id} &middot; generated {new Date(run.completedAt).toLocaleString()} &middot;{' '}
          {run.documentIds.length} document(s) &middot; {run.frameworkIds.length} framework(s)
        </div>
      </div>

      <section className="mb-8">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-fg-mute mb-3">Executive Summary</h3>
        <div className="grid grid-cols-4 gap-3 text-sm">
          <div className="border border-line rounded-md p-3"><div className="text-fg-mute text-2xs">Documents</div><div className="text-lg font-semibold">{run.stats.documentsAnalyzed}</div></div>
          <div className="border border-line rounded-md p-3"><div className="text-fg-mute text-2xs">Requirements Evaluated</div><div className="text-lg font-semibold">{run.stats.requirementsEvaluated}</div></div>
          <div className="border border-line rounded-md p-3"><div className="text-fg-mute text-2xs">Findings</div><div className="text-lg font-semibold">{run.stats.findings}</div></div>
          <div className="border border-line rounded-md p-3"><div className="text-fg-mute text-2xs">Critical / High</div><div className="text-lg font-semibold">{run.stats.criticalFindings} / {run.stats.highFindings}</div></div>
          <div className="border border-line rounded-md p-3"><div className="text-fg-mute text-2xs">Contradictions</div><div className="text-lg font-semibold">{run.stats.contradictions}</div></div>
          <div className="border border-line rounded-md p-3"><div className="text-fg-mute text-2xs">Implementation Gaps</div><div className="text-lg font-semibold">{run.stats.implementationGaps}</div></div>
          <div className="border border-line rounded-md p-3"><div className="text-fg-mute text-2xs">Agent Profiles</div><div className="text-lg font-semibold">{agentProfiles.length}</div></div>
          <div className="border border-line rounded-md p-3"><div className="text-fg-mute text-2xs">Evidence Items</div><div className="text-lg font-semibold">{run.stats.evidenceItems}</div></div>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-fg-mute mb-3">Framework Coverage</h3>
        <table className="w-full text-sm border border-line">
          <thead>
            <tr className="text-left border-b border-line">
              <th className="p-2">Framework</th>
              <th className="p-2">Requirements</th>
              <th className="p-2">Supported</th>
              <th className="p-2">Partial</th>
              <th className="p-2">Missing</th>
            </tr>
          </thead>
          <tbody>
            {coverage.map((c) => (
              <tr key={c.framework} className="border-b border-line/50">
                <td className="p-2">{FRAMEWORK_META[c.framework].shortName}</td>
                <td className="p-2 mono">{c.requirementCount}</td>
                <td className="p-2 mono">{c.supportedPct}%</td>
                <td className="p-2 mono">{c.partialPct}%</td>
                <td className="p-2 mono">{c.missingPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-fg-mute mb-3">
          Findings ({findings.length})
        </h3>
        <table className="w-full text-sm border border-line">
          <thead>
            <tr className="text-left border-b border-line">
              <th className="p-2">ID</th>
              <th className="p-2">Severity</th>
              <th className="p-2">Title</th>
              <th className="p-2">Control</th>
              <th className="p-2">Risk</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((f) => (
              <tr key={f.id} className="border-b border-line/50 align-top">
                <td className="p-2 mono text-2xs text-fg-mute">{f.id}</td>
                <td className={`p-2 mono text-2xs ${SEVERITY_CLASS[f.severity]}`}>{f.severity}</td>
                <td className="p-2">
                  {f.title}
                  <div className="text-2xs text-fg-mute mt-0.5">{f.reasoning}</div>
                </td>
                <td className="p-2 text-2xs">{CONTROLS[f.controlId]?.name ?? f.controlId}</td>
                <td className="p-2 mono">{f.riskScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {contradictions.length > 0 && (
        <section className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-fg-mute mb-3">
            Contradictions ({contradictions.length})
          </h3>
          {contradictions.map((c) => (
            <div key={c.id} className="border border-line rounded-md p-3 mb-2 text-sm">
              <div className="mono text-2xs text-fg-mute mb-1">{c.id} &middot; {CONTROLS[c.topic]?.name ?? c.topic} &middot; {c.severity}</div>
              <div className="mb-2">{c.conflictDescription}</div>
              <div className="text-2xs text-fg-mute">
                A. {docsById.get(c.documentA.documentId)?.filename ?? c.documentA.documentName}: &ldquo;{c.documentA.statement}&rdquo;
              </div>
              <div className="text-2xs text-fg-mute">
                B. {docsById.get(c.documentB.documentId)?.filename ?? c.documentB.documentName}: &ldquo;{c.documentB.statement}&rdquo;
              </div>
            </div>
          ))}
        </section>
      )}

      {agentProfiles.length > 0 && (
        <section className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-fg-mute mb-3">
            Agent Governance ({agentProfiles.length})
          </h3>
          {agentProfiles.map((a) => (
            <div key={a.name} className="border border-line rounded-md p-3 mb-2 text-sm">
              <div className="font-medium mb-1">{a.name}</div>
              <div className="text-2xs text-fg-mute">
                Tools: {a.tools.join(', ') || 'none detected'} &middot; External actions: {a.externalActionsCount} &middot;
                PII: {a.piiAccess} &middot; Financial: {a.financialAction} &middot; Human approval: {a.humanApproval} &middot;
                Logging: {a.logging} &middot; Monitoring: {a.monitoring} &middot; Kill switch: {a.killSwitch} &middot;
                Least privilege: {a.leastPrivilege} &middot; Incident procedure: {a.incidentProcedure}
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="text-2xs text-fg-mute border-t border-line pt-4">
        POLICY//AUDIT is an engineering and governance assessment tool. It does not provide legal advice
        and does not independently establish legal compliance. Requirement text is a paraphrased, curated
        interpretation for evidence-matching purposes. Evidence matching is deterministic keyword/pattern
        reasoning over document text, not a legal sufficiency judgement. Always have qualified legal and
        compliance review before relying on this report.
      </section>
    </div>
  );
}
