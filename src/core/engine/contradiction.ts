import type { ControlId, Contradiction, Evidence, Finding, FrameworkId, Severity } from '../types';
import { CONTROLS } from '../frameworks/controls';
import { controlCriticality } from './severity';
import { nextId } from './ids';

/**
 * Document contradiction engine (spec section 15) — a flagship feature.
 * Deliberately conservative: every rule below requires topic overlap AND
 * an opposing-scope signal, never just "these two sentences differ." The
 * canonical example this is built to catch:
 *
 *   Doc A: "All high-risk decisions require human approval."
 *   Doc B: "Claims below EUR 10,000 are automatically approved."
 */

const UNIVERSAL_SCOPE = /\ball\b|\bevery\b|\bany\b|\bhigh-risk\b|\bmust\b/i;
const APPROVAL_REQUIRED = /require[sd]?\s+(?:human\s+)?(?:approval|review|authorization|sign-?off)/i;
const AUTO_APPROVED = /automatically approved|auto-approved|approved without (?:human |operator )?review|no (?:human |operator )?review (?:is )?required|bypasses? (?:human )?review/i;
const THRESHOLD_EXCEPTION = /\b(below|under|less than|up to)\b.{0,20}[\$\u20ac\u00a3\d]/i;
const PROHIBITS = /\bmust not\b|\bshall not\b|\bprohibited\b|\bnot permitted\b|\bforbidden\b/i;
const PERMITS = /\bmay\b|\ballows?\b|\benables?\b|\bpermitted\b|\bcan access\b|\bhas access\b/i;

function significantTokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 4)
  );
}

function overlapCount(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const t of a) if (b.has(t)) n += 1;
  return n;
}

interface Rule {
  topic: ControlId;
  matches: (a: Evidence, b: Evidence) => boolean;
  describe: (a: Evidence, b: Evidence) => string;
}

const RULES: Rule[] = [
  {
    topic: 'human-oversight',
    matches: (a, b) =>
      (APPROVAL_REQUIRED.test(a.text) && UNIVERSAL_SCOPE.test(a.text) && AUTO_APPROVED.test(b.text)) ||
      (APPROVAL_REQUIRED.test(b.text) && UNIVERSAL_SCOPE.test(b.text) && AUTO_APPROVED.test(a.text)),
    describe: () => 'One document requires human approval broadly; another describes an automatic-approval path that bypasses it, with no documented reconciliation.',
  },
  {
    topic: 'human-oversight',
    matches: (a, b) =>
      (APPROVAL_REQUIRED.test(a.text) && UNIVERSAL_SCOPE.test(a.text) && THRESHOLD_EXCEPTION.test(b.text) && AUTO_APPROVED.test(b.text)) ||
      (APPROVAL_REQUIRED.test(b.text) && UNIVERSAL_SCOPE.test(b.text) && THRESHOLD_EXCEPTION.test(a.text) && AUTO_APPROVED.test(a.text)),
    describe: () => 'Policy states a universal approval requirement while architecture/config defines a monetary threshold under which approval is skipped.',
  },
  {
    topic: 'data-leakage-prevention',
    matches: (a, b) => (PROHIBITS.test(a.text) && PERMITS.test(b.text)) || (PROHIBITS.test(b.text) && PERMITS.test(a.text)),
    describe: () => 'One document prohibits an action or access type that another document/configuration permits.',
  },
];

function severityForTopic(topic: ControlId): Severity {
  const crit = controlCriticality(topic);
  if (crit >= 0.85) return 'CRITICAL';
  if (crit >= 0.65) return 'HIGH';
  return 'MEDIUM';
}

export function detectContradictions(evidence: Evidence[]): Contradiction[] {
  const results: Contradiction[] = [];
  const seenPairs = new Set<string>();

  const byControl = new Map<ControlId, Evidence[]>();
  for (const e of evidence) {
    for (const c of e.controlIds) {
      if (!byControl.has(c)) byControl.set(c, []);
      byControl.get(c)!.push(e);
    }
  }

  for (const rule of RULES) {
    const pool = byControl.get(rule.topic) ?? [];
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        const a = pool[i];
        const b = pool[j];
        if (a.documentId === b.documentId) continue; // require cross-document conflict
        const pairKey = [a.id, b.id].sort().join('|');
        if (seenPairs.has(pairKey)) continue;
        if (!rule.matches(a, b)) continue;
        const overlap = overlapCount(significantTokens(a.text), significantTokens(b.text));
        const confidence = Math.min(0.97, 0.72 + overlap * 0.04);
        seenPairs.add(pairKey);
        results.push({
          id: nextId('CX'),
          topic: rule.topic,
          severity: severityForTopic(rule.topic),
          documentA: { documentId: a.documentId, documentName: a.documentName, page: a.page, section: a.section, statement: a.keyStatement },
          documentB: { documentId: b.documentId, documentName: b.documentName, page: b.page, section: b.section, statement: b.keyStatement },
          conflictDescription: rule.describe(a, b),
          confidence: Math.round(confidence * 100) / 100,
        });
      }
    }
  }

  return results;
}

export function contradictionsToFindings(contradictions: Contradiction[]): Finding[] {
  return contradictions.map((c): Finding => ({
    id: `FC-${c.id}`,
    type: 'CONFLICT',
    severity: c.severity,
    frameworkIds: [] as FrameworkId[],
    requirementIds: [] as string[],
    controlId: c.topic,
    status: 'PARTIAL' as const,
    title: `Contradiction: ${CONTROLS[c.topic].name}`,
    evidenceIds: [] as string[],
    missingElements: [] as string[],
    conflictEvidenceIds: undefined,
    riskScore: c.severity === 'CRITICAL' ? 90 : c.severity === 'HIGH' ? 70 : 50,
    riskFactors: {
      severityWeight: 0.9,
      applicabilityWeight: 1,
      evidenceConfidence: c.confidence,
      controlCriticality: controlCriticality(c.topic),
      impactWeight: controlCriticality(c.topic),
      exploitabilityWeight: 0.3,
      affectedSystemsCount: 2,
      frameworksAffectedCount: 1,
      hasConflictingEvidence: true,
    },
    confidence: c.confidence,
    sourceDocumentIds: [c.documentA.documentId, c.documentB.documentId],
    reasoning: c.conflictDescription,
    remediation: `Reconcile the conflicting statements: "${c.documentA.statement}" (${c.documentA.documentName}) vs. "${c.documentB.statement}" (${c.documentB.documentName}). Decide which governs and update the other document.`,
    createdAt: new Date().toISOString(),
  }));
}
