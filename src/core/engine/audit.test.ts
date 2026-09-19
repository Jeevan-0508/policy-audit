import { describe, expect, test } from 'bun:test';
import type { EvidenceChunk } from '../types';
import { classifyChunks } from '../extraction/classify';
import { ALL_REQUIREMENTS } from '../frameworks';
import { matchAllRequirements } from './match';
import { buildCoverageFindings } from './findings';
import { detectContradictions } from './contradiction';
import { detectImplementationGaps } from './implementationGap';
import { buildAgentProfiles } from './agentGovernance';
import { resetIdCounter } from './ids';

function chunk(text: string, documentId: string, documentName: string, extra: Partial<EvidenceChunk> = {}): EvidenceChunk {
  return {
    id: `CH-${Math.random()}`,
    documentId,
    documentName,
    text,
    extractionConfidence: 0.95,
    extractedAt: new Date().toISOString(),
    ...extra,
  };
}

describe('classification', () => {
  test('detects human oversight control and affirmative polarity', () => {
    const [ev] = classifyChunks(
      [chunk('Operators may review AI recommendations before final decision. Escalation to a senior reviewer is possible.', 'DOC-1', 'Human_Oversight_SOP.pdf', { page: 7, section: 'Human Oversight Process' })],
      'pdf'
    );
    expect(ev.controlIds).toContain('human-oversight');
    expect(ev.confidence).toBeGreaterThan(0.5);
  });
});

describe('requirement matching', () => {
  test('MISSING when no evidence exists for a control', () => {
    resetIdCounter();
    const matches = matchAllRequirements(ALL_REQUIREMENTS, []);
    expect(matches.every((m) => m.status === 'MISSING')).toBe(true);
  });

  test('PARTIAL when evidence covers control but not technical expectations', () => {
    resetIdCounter();
    const evidence = classifyChunks(
      [chunk('Operators may review AI recommendations before making a final decision.', 'DOC-1', 'Human_Oversight_SOP.pdf')],
      'pdf'
    );
    const req = ALL_REQUIREMENTS.find((r) => r.id === 'REQ-EUAI-HO-001')!;
    const matches = matchAllRequirements([req], evidence);
    expect(matches[0].status).toBe('PARTIAL');
    expect(matches[0].unmetTechnicalExpectations.length).toBeGreaterThan(0);
  });

  test('SUPPORTED when all expectations are covered', () => {
    resetIdCounter();
    const evidence = classifyChunks(
      [
        chunk(
          'The human oversight procedure defines an override capability, a documented stop mechanism, an escalation trigger with defined SLA, and requires operator authorization before any high-impact action, all captured in the audit trail of interventions. The Head of AI Risk is the named oversight role responsible for this procedure, and an operator training record is maintained for every operator.',
          'DOC-1',
          'Human_Oversight_SOP.pdf'
        ),
      ],
      'pdf'
    );
    const req = ALL_REQUIREMENTS.find((r) => r.id === 'REQ-EUAI-HO-001')!;
    const matches = matchAllRequirements([req], evidence);
    expect(matches[0].status).toBe('SUPPORTED');
  });
});

describe('finding generation', () => {
  test('produces HUMAN_OVERSIGHT_GAP finding for partial human oversight evidence', () => {
    resetIdCounter();
    const evidence = classifyChunks(
      [chunk('Operators may review AI recommendations before making a final decision.', 'DOC-1', 'Human_Oversight_SOP.pdf', { page: 7 })],
      'pdf'
    );
    const req = ALL_REQUIREMENTS.filter((r) => r.controlIds.includes('human-oversight'));
    const matches = matchAllRequirements(req, evidence);
    const findings = buildCoverageFindings(matches);
    expect(findings.some((f) => f.type === 'HUMAN_OVERSIGHT_GAP')).toBe(true);
  });

  test('MISSING requirement with no evidence produces a finding with MISSING or a domain-specific type', () => {
    resetIdCounter();
    const req = ALL_REQUIREMENTS.filter((r) => r.controlIds.includes('incident-response'));
    const matches = matchAllRequirements(req, []);
    const findings = buildCoverageFindings(matches);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].status).toBe('MISSING');
  });
});

describe('contradiction engine', () => {
  test('detects universal approval requirement vs. auto-approval threshold', () => {
    resetIdCounter();
    const evidence = classifyChunks(
      [
        chunk('All high-risk decisions require human approval before execution.', 'DOC-A', 'AI_Policy.pdf', { page: 12 }),
        chunk('Claims below EUR 10,000 are automatically approved without human review.', 'DOC-B', 'Claims_Architecture.pdf', { page: 18 }),
      ],
      'pdf'
    );
    const contradictions = detectContradictions(evidence);
    expect(contradictions.length).toBeGreaterThan(0);
    expect(contradictions[0].topic).toBe('human-oversight');
    expect(contradictions[0].severity).not.toBe('LOW');
  });

  test('does not flag two affirmative statements about the same topic as a contradiction', () => {
    resetIdCounter();
    const evidence = classifyChunks(
      [
        chunk('All high-risk decisions require human approval before execution.', 'DOC-A', 'AI_Policy.pdf'),
        chunk('All high-risk decisions require human approval before execution, per policy.', 'DOC-B', 'Second_Policy.pdf'),
      ],
      'pdf'
    );
    const contradictions = detectContradictions(evidence);
    expect(contradictions.length).toBe(0);
  });
});

describe('implementation gap engine', () => {
  test('flags policy prohibition vs. config access grant on the same resource', () => {
    resetIdCounter();
    const policyEvidence = classifyChunks(
      [chunk('Agents must not access production customer data under any circumstances.', 'DOC-A', 'AI_Security_Policy.pdf', { page: 3 })],
      'pdf'
    );
    const configEvidence = classifyChunks(
      [chunk('tools: [production_customer_data]\npermissions.production_customer_data.access: read', 'DOC-B', 'Agent_Config.yaml')],
      'yaml'
    );
    const gaps = detectImplementationGaps([...policyEvidence, ...configEvidence]);
    expect(gaps.length).toBeGreaterThan(0);
    expect(gaps[0].type).toBe('IMPLEMENTATION_GAP');
    expect(gaps[0].severity).toBe('CRITICAL');
  });

  test('does not flag when there is no matching resource overlap', () => {
    resetIdCounter();
    const policyEvidence = classifyChunks(
      [chunk('Agents must not access production customer data under any circumstances.', 'DOC-A', 'AI_Security_Policy.pdf')],
      'pdf'
    );
    const configEvidence = classifyChunks(
      [chunk('tools: [weather_lookup]\npermissions.weather_lookup.access: read', 'DOC-B', 'Agent_Config.yaml')],
      'yaml'
    );
    const gaps = detectImplementationGaps([...policyEvidence, ...configEvidence]);
    expect(gaps.length).toBe(0);
  });
});

describe('agent governance', () => {
  test('builds a profile with MISSING kill switch when no evidence mentions one', () => {
    resetIdCounter();
    const evidence = classifyChunks(
      [
        chunk('ClaimsAgent uses tools: [production_customer_data]. ClaimsAgent processes financial claims.', 'DOC-A', 'Claims_Agent_Architecture.pdf'),
      ],
      'pdf'
    );
    const profiles = buildAgentProfiles(evidence);
    expect(profiles.length).toBe(1);
    expect(profiles[0].name).toBe('ClaimsAgent');
    expect(profiles[0].killSwitch).toBe('MISSING');
  });
});
