import type { Evidence, Finding, FrameworkId } from '../types';
import { nextId } from './ids';
import { controlCriticality } from './severity';
import { computeRiskScore, severityFromScore } from './severity';

/**
 * Policy -> implementation gap engine (spec section 16) — the primary demo.
 * Deterministically compares prohibition language in policy-type evidence
 * against access grants found in configuration evidence (YAML/JSON), e.g.:
 *
 *   Policy:  "Agents must not access production customer data."
 *   Config:  tools: [production_customer_db]  permissions.production_customer_db.access: read
 *   -> IMPLEMENTATION_GAP, CRITICAL
 */

const PROHIBITION_PATTERN = /(?:must not|shall not|is prohibited from|are prohibited from|no access to|not permitted to access)\s+(?:accessing\s+)?([a-z0-9][a-z0-9 _\-]{3,60})/gi;
const GRANT_LINE_PATTERN = /([a-z0-9_.\-]+)\s*[:.]?\s*(?:access)?\s*:\s*(read|write|admin|readwrite|read-write|true|allow|allowed)\b/gi;

/** Structural/generic words that appear on both sides of nearly every
 * policy-vs-config pair (the verb "access", the wrapper words in a dotted
 * config key) and would otherwise create false-positive resource overlap. */
const STRUCTURAL_STOPWORDS = new Set([
  'access', 'accessing', 'permission', 'permissions', 'tool', 'tools',
  'config', 'configuration', 'level', 'under', 'any', 'circumstances',
  'within', 'regardless', 'whatsoever', 'the', 'and', 'for',
]);

function tokenSet(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .filter((w) => w.length > 2 && !STRUCTURAL_STOPWORDS.has(w))
  );
}

interface ProhibitedResource {
  phrase: string;
  tokens: Set<string>;
  evidence: Evidence;
}

interface GrantedAccess {
  resource: string;
  level: string;
  tokens: Set<string>;
  evidence: Evidence;
}

function extractProhibitions(evidence: Evidence[]): ProhibitedResource[] {
  const out: ProhibitedResource[] = [];
  for (const e of evidence) {
    if (e.evidenceType === 'configuration') continue;
    let m: RegExpExecArray | null;
    const re = new RegExp(PROHIBITION_PATTERN);
    while ((m = re.exec(e.text)) !== null) {
      const phrase = m[1].trim();
      out.push({ phrase, tokens: tokenSet(phrase), evidence: e });
    }
  }
  return out;
}

function extractGrants(evidence: Evidence[]): GrantedAccess[] {
  const out: GrantedAccess[] = [];
  for (const e of evidence) {
    if (e.evidenceType !== 'configuration') continue;
    for (const line of e.text.split(/\n|\|/)) {
      const m = new RegExp(GRANT_LINE_PATTERN).exec(line);
      if (m) {
        const resource = m[1];
        out.push({ resource, level: m[2].toLowerCase(), tokens: tokenSet(resource), evidence: e });
      }
    }
  }
  return out;
}

function tokenOverlap(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const t of a) if (b.has(t)) n += 1;
  return n;
}

export function detectImplementationGaps(evidence: Evidence[]): Finding[] {
  const prohibitions = extractProhibitions(evidence);
  const grants = extractGrants(evidence);
  const findings: Finding[] = [];
  const seen = new Set<string>();

  for (const prohibition of prohibitions) {
    for (const grant of grants) {
      const overlap = tokenOverlap(prohibition.tokens, grant.tokens);
      if (overlap < 1) continue;
      const key = `${prohibition.evidence.id}|${grant.evidence.id}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const confidence = Math.min(0.96, 0.65 + overlap * 0.12);
      // A policy/implementation gap is, by construction, an unauthorized
      // data-access path that nobody caught — it is scored at the top of
      // both criticality inputs deliberately (spec section 16's example is
      // CRITICAL, not HIGH, because the exposure is live, not theoretical).
      const riskFactors = {
        severityWeight: 1,
        applicabilityWeight: 1,
        evidenceConfidence: confidence,
        controlCriticality: Math.max(controlCriticality('agent-least-privilege'), controlCriticality('data-leakage-prevention')),
        impactWeight: 1,
        exploitabilityWeight: 0.95,
        affectedSystemsCount: 1,
        frameworksAffectedCount: 2,
        hasConflictingEvidence: true,
      };
      const riskScore = computeRiskScore(riskFactors);

      findings.push({
        id: nextId('FI'),
        type: 'IMPLEMENTATION_GAP',
        severity: severityFromScore(riskScore),
        frameworkIds: [] as FrameworkId[],
        requirementIds: ['REQ-AGENT-PRIV-001'],
        controlId: 'agent-least-privilege',
        status: 'PARTIAL',
        title: `Policy vs. implementation conflict: "${prohibition.phrase}" vs. granted access`,
        evidenceIds: [prohibition.evidence.id, grant.evidence.id],
        missingElements: [`Revoke or justify "${grant.level}" access to ${grant.resource}`],
        riskScore,
        riskFactors,
        confidence: Math.round(confidence * 100) / 100,
        sourceDocumentIds: [prohibition.evidence.documentId, grant.evidence.documentId],
        reasoning: `Policy statement in ${prohibition.evidence.documentName} prohibits "${prohibition.phrase}", but ${grant.evidence.documentName} grants "${grant.level}" access to "${grant.resource}", which shares terms with the prohibited resource.`,
        remediation: `Remove or restrict the "${grant.level}" permission on "${grant.resource}" in ${grant.evidence.documentName}, or update the policy in ${prohibition.evidence.documentName} if the access is intentional and reviewed.`,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return findings;
}
