import type { AgentProfile, AuditRun, Contradiction, Evidence, Finding, FrameworkCoverage, FrameworkId, GovDocument, Requirement } from '../types';
import { ALL_REQUIREMENTS } from '../frameworks';
import { classifyChunks } from '../extraction/classify';
import { matchAllRequirements } from './match';
import { buildCoverageFindings } from './findings';
import { detectContradictions, contradictionsToFindings } from './contradiction';
import { detectImplementationGaps } from './implementationGap';
import { buildAgentProfiles } from './agentGovernance';
import { computeFrameworkCoverage } from './coverage';
import { nextId } from './ids';
import type { IngestResult } from '../parsers';

export interface AuditResult {
  run: AuditRun;
  documents: GovDocument[];
  evidence: Evidence[];
  requirements: Requirement[];
  findings: Finding[];
  contradictions: Contradiction[];
  agentProfiles: AgentProfile[];
  coverage: FrameworkCoverage[];
}

/**
 * Full pipeline, per spec section 25's mandated order:
 *   ingestion -> chunking -> evidence classification -> requirement
 *   matching -> deterministic finding engine -> (LLM only ever explains,
 *   never overrides, and is not wired in by default here).
 */
export function runAudit(ingested: IngestResult[], frameworkFilter?: FrameworkId[]): AuditResult {
  const documents = ingested.map((i) => i.document);
  const evidence: Evidence[] = ingested.flatMap((i) => classifyChunks(i.chunks, i.document.fileType));

  const requirements = frameworkFilter?.length
    ? ALL_REQUIREMENTS.filter((r) => frameworkFilter.includes(r.framework))
    : ALL_REQUIREMENTS;

  const matches = matchAllRequirements(requirements, evidence);
  const coverageFindings = buildCoverageFindings(matches);
  const contradictions = detectContradictions(evidence);
  const conflictFindings = contradictionsToFindings(contradictions);
  const implementationGapFindings = detectImplementationGaps(evidence);
  const agentProfiles = buildAgentProfiles(evidence);
  const coverage = computeFrameworkCoverage(matches);

  const findings = [...coverageFindings, ...conflictFindings, ...implementationGapFindings].sort(
    (a, b) => b.riskScore - a.riskScore
  );

  const run: AuditRun = {
    id: nextId('RUN'),
    documentIds: documents.map((d) => d.id),
    frameworkIds: [...new Set(requirements.map((r) => r.framework))],
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    stats: {
      documentsAnalyzed: documents.length,
      requirementsEvaluated: requirements.length,
      evidenceItems: evidence.length,
      findings: findings.length,
      criticalFindings: findings.filter((f) => f.severity === 'CRITICAL').length,
      highFindings: findings.filter((f) => f.severity === 'HIGH').length,
      contradictions: contradictions.length,
      implementationGaps: implementationGapFindings.length,
    },
  };

  return { run, documents, evidence, requirements, findings, contradictions, agentProfiles, coverage };
}
