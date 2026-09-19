import type { AgentProfile, Evidence } from '../types';

/**
 * Agent Governance analysis (spec section 23). Builds one AgentProfile per
 * detected agent name and answers each governance question from evidence,
 * never from a template — an agent with zero matching evidence gets
 * MISSING/UNKNOWN across the board, which is itself the finding.
 */

const AGENT_NAME_PATTERN = /\b([A-Z][a-zA-Z]*Agent)\b/g;

const STRONG_INDICATORS = {
  humanApproval: [/approval gate/i, /blocks? execution until/i, /requires explicit (?:human )?approval/i],
  logging: [/correlation id/i, /trace id/i, /model version.*logged|logged.*model version/i, /structured log/i],
  monitoring: [/anomaly detection/i, /drift (?:detection|monitoring)/i, /alerts? (?:a|the) (?:human|owner|operator)/i],
  leastPrivilege: [/scoped permission/i, /minimum (?:necessary|required) access/i, /read-only/i],
  killSwitch: [/tested/i, /kill switch/i, /safe-stop/i, /emergency stop/i],
  incidentProcedure: [/escalation sla/i, /detect(?:ion|s)?.{0,20}escalat/i, /post-incident review/i],
};

function detectAgentNames(evidence: Evidence[]): string[] {
  const names = new Set<string>();
  for (const e of evidence) {
    const matches = e.text.match(AGENT_NAME_PATTERN);
    matches?.forEach((m) => names.add(m));
    e.tags.filter((t) => /Agent$/.test(t)).forEach((t) => names.add(t));
  }
  return [...names];
}

function triState(
  relevantEvidence: Evidence[],
  strongIndicators: RegExp[]
): 'YES' | 'PARTIAL' | 'MISSING' {
  if (relevantEvidence.length === 0) return 'MISSING';
  const hasStrong = relevantEvidence.some((e) => strongIndicators.some((re) => re.test(e.text)));
  return hasStrong ? 'YES' : 'PARTIAL';
}

function biState(relevantEvidence: Evidence[], strongIndicators: RegExp[]): 'YES' | 'MISSING' {
  if (relevantEvidence.length === 0) return 'MISSING';
  return relevantEvidence.some((e) => strongIndicators.some((re) => re.test(e.text))) ? 'YES' : 'MISSING';
}

function forAgentOrGeneral(evidence: Evidence[], agentName: string, controlId: string): Evidence[] {
  const named = evidence.filter((e) => e.controlIds.includes(controlId as never) && e.tags.includes(agentName));
  if (named.length > 0) return named;
  // If the corpus only describes one agent, unattributed control evidence
  // (e.g. a standalone Human Oversight SOP) is reasonably attributed to it.
  const agentNames = detectAgentNames(evidence);
  if (agentNames.length <= 1) {
    return evidence.filter((e) => e.controlIds.includes(controlId as never));
  }
  return named;
}

export function buildAgentProfiles(evidence: Evidence[]): AgentProfile[] {
  const agentNames = detectAgentNames(evidence);
  if (agentNames.length === 0) return [];

  return agentNames.map((name): AgentProfile => {
    const nameEvidence = evidence.filter((e) => e.tags.includes(name) || e.text.includes(name));

    const toolLines = evidence.filter((e) => e.evidenceType === 'configuration' && (e.text.includes(name) || agentNames.length <= 1));
    const toolSet = new Set<string>();
    for (const e of toolLines) {
      const toolMatches = e.text.match(/tools?(?:\[\d+\])?:\s*([a-z0-9_.\-]+)/gi);
      toolMatches?.forEach((m) => {
        const val = m.split(':').slice(1).join(':').trim();
        if (val) toolSet.add(val);
      });
    }

    const externalActionsCount = nameEvidence.filter((e) =>
      /\b(api call|webhook|external|send email|transfer funds|third-party endpoint)\b/i.test(e.text)
    ).length;

    const piiAccess = nameEvidence.some((e) => e.tags.includes('pii')) ? 'YES' : nameEvidence.length > 0 ? 'NO' : 'UNKNOWN';
    const financialAction = nameEvidence.some((e) => e.tags.includes('financial')) ? 'YES' : nameEvidence.length > 0 ? 'NO' : 'UNKNOWN';

    const approvalEvidence = forAgentOrGeneral(evidence, name, 'agent-human-approval');
    const loggingEvidence = forAgentOrGeneral(evidence, name, 'record-keeping-logging');
    const monitoringEvidence = forAgentOrGeneral(evidence, name, 'post-market-monitoring');
    const privilegeEvidence = forAgentOrGeneral(evidence, name, 'agent-least-privilege');
    const killSwitchEvidence = forAgentOrGeneral(evidence, name, 'agent-kill-switch');
    const incidentEvidence = forAgentOrGeneral(evidence, name, 'incident-response');

    return {
      name,
      sourceDocumentIds: [...new Set(nameEvidence.map((e) => e.documentId))],
      sourceEvidenceIds: [...new Set(nameEvidence.map((e) => e.id))],
      tools: [...toolSet],
      externalActionsCount,
      piiAccess,
      financialAction,
      humanApproval: triState(approvalEvidence, STRONG_INDICATORS.humanApproval),
      logging: triState(loggingEvidence, STRONG_INDICATORS.logging),
      monitoring: triState(monitoringEvidence, STRONG_INDICATORS.monitoring),
      killSwitch: biState(killSwitchEvidence, STRONG_INDICATORS.killSwitch),
      leastPrivilege: triState(privilegeEvidence, STRONG_INDICATORS.leastPrivilege),
      incidentProcedure: biState(incidentEvidence, STRONG_INDICATORS.incidentProcedure),
    };
  });
}
