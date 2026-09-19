import { useAuditStore } from '../lib/store';
import { EmptyState } from '../components/StatCard';
import type { AgentProfile } from '@core/types';

function StateBadge({ value }: { value: string }) {
  const color = value === 'YES' ? 'text-support border-support/40 bg-support/15' : value === 'PARTIAL' ? 'text-partial border-partial/40 bg-partial/15' : 'text-missing border-missing/40 bg-missing/15';
  return <span className={`mono text-2xs px-2 py-0.5 rounded border ${color}`}>{value}</span>;
}

function AgentCard({ agent }: { agent: AgentProfile }) {
  return (
    <div className="border border-line rounded-md bg-ink-800 p-4">
      <div className="font-medium mb-3">{agent.name}</div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex justify-between"><span className="text-fg-dim">Tools</span><span className="mono">{agent.tools.length}</span></div>
        <div className="flex justify-between"><span className="text-fg-dim">External Actions</span><span className="mono">{agent.externalActionsCount}</span></div>
        <div className="flex justify-between"><span className="text-fg-dim">PII Access</span><StateBadge value={agent.piiAccess} /></div>
        <div className="flex justify-between"><span className="text-fg-dim">Financial Action</span><StateBadge value={agent.financialAction} /></div>
        <div className="flex justify-between"><span className="text-fg-dim">Human Approval</span><StateBadge value={agent.humanApproval} /></div>
        <div className="flex justify-between"><span className="text-fg-dim">Logging</span><StateBadge value={agent.logging} /></div>
        <div className="flex justify-between"><span className="text-fg-dim">Monitoring</span><StateBadge value={agent.monitoring} /></div>
        <div className="flex justify-between"><span className="text-fg-dim">Kill Switch</span><StateBadge value={agent.killSwitch} /></div>
        <div className="flex justify-between"><span className="text-fg-dim">Least Privilege</span><StateBadge value={agent.leastPrivilege} /></div>
        <div className="flex justify-between"><span className="text-fg-dim">Incident Procedure</span><StateBadge value={agent.incidentProcedure} /></div>
      </div>
      {agent.tools.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {agent.tools.map((t) => (
            <span key={t} className="mono text-2xs px-1.5 py-0.5 rounded bg-ink-600 text-fg-dim">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function AgentGovernance() {
  const { result } = useAuditStore();

  if (!result) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold mb-6">Agent Governance</h1>
        <EmptyState title="No agents detected yet" body="Run an audit on documents that describe agents (architecture docs, agent config) to see per-agent governance profiles." />
      </div>
    );
  }

  if (result.agentProfiles.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold mb-6">Agent Governance</h1>
        <EmptyState title="No agents detected in this corpus" body="No document mentioned an entity named like 'XyzAgent'. This screen only activates when agentic systems are present." />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-1">Agent Governance</h1>
      <p className="text-sm text-fg-dim mb-6">{result.agentProfiles.length} agent(s) detected. Every field is derived from evidence, not assumed.</p>
      <div className="grid grid-cols-2 gap-4">
        {result.agentProfiles.map((a) => (
          <AgentCard key={a.name} agent={a} />
        ))}
      </div>
    </div>
  );
}
