import type { ControlId, Evidence, Finding, FindingType, FrameworkId, Requirement, Severity } from '../types';
import type { RequirementMatch } from './match';
import { computeRiskScore, controlCriticality, severityFromScore } from './severity';
import { nextId } from './ids';
import { CONTROLS } from '../frameworks/controls';

function decideFindingType(requirement: Requirement, unmetTechnical: string[], unmetOrganizational: string[]): FindingType {
  const domain = requirement.domain.toLowerCase();
  const onlyOwnershipUnmet =
    unmetTechnical.length === 0 &&
    unmetOrganizational.length > 0 &&
    unmetOrganizational.every((e) => /owner|accountable|responsible/i.test(e));
  if (onlyOwnershipUnmet) return 'OWNERSHIP_GAP';
  if (domain.includes('human oversight')) return 'HUMAN_OVERSIGHT_GAP';
  if (domain.includes('logging') || domain.includes('monitoring')) {
    return domain.includes('monitoring') && !domain.includes('logging') ? 'MONITORING_GAP' : 'LOGGING_GAP';
  }
  if (domain.includes('incident')) return 'INCIDENT_GAP';
  if (domain.includes('change')) return 'CHANGE_GAP';
  if (domain.includes('security') || requirement.framework === 'ai-security') return 'SECURITY_GAP';
  return 'PARTIAL';
}

function remediationFor(requirement: Requirement, unmetTechnical: string[], unmetOrganizational: string[]): string {
  const items = [...unmetTechnical, ...unmetOrganizational];
  if (items.length === 0) {
    return `Provide evidence addressing "${requirement.controlObjective}" (${requirement.reference}).`;
  }
  return `Define and evidence: ${items.join('; ')}. Objective: ${requirement.controlObjective}`;
}

interface FindingGroup {
  controlId: ControlId;
  requirements: Requirement[];
  matchedEvidence: Evidence[];
  worstStatus: 'MISSING' | 'PARTIAL';
  unmetTechnical: string[];
  unmetOrganizational: string[];
}

function groupByControl(matches: RequirementMatch[]): FindingGroup[] {
  const groups = new Map<ControlId, FindingGroup>();
  for (const match of matches) {
    if (match.status === 'SUPPORTED') continue;
    for (const controlId of match.requirement.controlIds) {
      if (!groups.has(controlId)) {
        groups.set(controlId, {
          controlId,
          requirements: [],
          matchedEvidence: [],
          worstStatus: 'PARTIAL',
          unmetTechnical: [],
          unmetOrganizational: [],
        });
      }
      const group = groups.get(controlId)!;
      group.requirements.push(match.requirement);
      group.matchedEvidence.push(...match.matchedEvidence);
      if (match.status === 'MISSING') group.worstStatus = 'MISSING';
      group.unmetTechnical.push(...match.unmetTechnicalExpectations);
      group.unmetOrganizational.push(...match.unmetOrganizationalExpectations);
    }
  }
  return [...groups.values()];
}

/**
 * Turns grouped requirement gaps into user-facing Findings. Grouping by
 * control (not by requirement) is what implements the crosswalk principle
 * from spec section 13/14: one gap in "Human Oversight" evidence produces
 * ONE finding referencing every framework requirement it affects, instead
 * of five near-duplicate findings.
 */
export function buildCoverageFindings(matches: RequirementMatch[]): Finding[] {
  const groups = groupByControl(matches);
  const findings: Finding[] = [];

  for (const group of groups) {
    const representative = group.requirements[0];
    const unmetTechnical = [...new Set(group.unmetTechnical)];
    const unmetOrganizational = [...new Set(group.unmetOrganizational)];
    const type = decideFindingType(representative, unmetTechnical, unmetOrganizational);
    const frameworkIds = [...new Set(group.requirements.map((r) => r.framework))] as FrameworkId[];
    const documentIds = [...new Set(group.matchedEvidence.map((e) => e.documentId))];
    const avgConfidence = group.matchedEvidence.length
      ? group.matchedEvidence.reduce((s, e) => s + e.confidence, 0) / group.matchedEvidence.length
      : 0.5;

    const riskFactors = {
      severityWeight: group.worstStatus === 'MISSING' ? 0.9 : 0.55,
      applicabilityWeight: 1,
      evidenceConfidence: avgConfidence,
      controlCriticality: controlCriticality(group.controlId),
      impactWeight: controlCriticality(group.controlId),
      exploitabilityWeight: CONTROLS[group.controlId].category === 'security' || CONTROLS[group.controlId].category === 'agentic' ? 0.7 : 0.2,
      affectedSystemsCount: documentIds.length,
      frameworksAffectedCount: frameworkIds.length,
      hasConflictingEvidence: false,
    };
    const riskScore = computeRiskScore(riskFactors);
    const severity: Severity = severityFromScore(riskScore);

    findings.push({
      id: nextId('F'),
      type,
      severity,
      frameworkIds,
      requirementIds: group.requirements.map((r) => r.id),
      controlId: group.controlId,
      status: group.worstStatus,
      title: `${group.worstStatus === 'MISSING' ? 'Missing' : 'Insufficient'} evidence for ${CONTROLS[group.controlId].name}`,
      evidenceIds: [...new Set(group.matchedEvidence.map((e) => e.id))],
      missingElements: [...unmetTechnical, ...unmetOrganizational],
      riskScore,
      riskFactors,
      confidence: Math.round(avgConfidence * 100) / 100,
      sourceDocumentIds: documentIds,
      reasoning:
        group.worstStatus === 'MISSING'
          ? `No evidence in the corpus was classified against the "${CONTROLS[group.controlId].name}" control, which is required by ${group.requirements.map((r) => `${r.framework} ${r.reference}`).join(', ')}.`
          : `Evidence exists for "${CONTROLS[group.controlId].name}" but does not cover: ${[...unmetTechnical, ...unmetOrganizational].join(', ') || 'all stated expectations'}.`,
      remediation: remediationFor(representative, unmetTechnical, unmetOrganizational),
      createdAt: new Date().toISOString(),
    });
  }

  return findings;
}
