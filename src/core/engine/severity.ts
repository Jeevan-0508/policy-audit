import type { RiskFactors, Severity } from '../types';

/**
 * Transparent risk prioritization (spec section 18). No hidden "compliance
 * score" — every input and weight is named here and surfaced verbatim in
 * the UI's Methodology panel (see app/screens/Reports.tsx).
 *
 * riskScore (0-100) =
 *   30 * severityWeight              (how bad is this class of gap, 0-1)
 * + 20 * controlCriticality          (how load-bearing is the control, 0-1)
 * + 15 * impactWeight                (blast radius if exploited/triggered, 0-1)
 * + 10 * (1 - evidenceConfidence)    (uncertainty in what evidence exists)
 * + 10 * frameworksAffectedNorm      (min(frameworksAffected, 4) / 4)
 * + 10 * affectedSystemsNorm         (min(affectedSystems, 5) / 5)
 * +  5 * conflictBonus               (1 if contradicting evidence exists, else 0)
 *
 * exploitabilityWeight is folded into impactWeight for security-flavored
 * findings (agent/security controls); it is 0 for pure documentation gaps.
 */
export const RISK_WEIGHTS = {
  severity: 30,
  controlCriticality: 20,
  impact: 15,
  evidenceUncertainty: 10,
  frameworksAffected: 10,
  affectedSystems: 10,
  conflictBonus: 5,
} as const;

export function computeRiskScore(f: RiskFactors): number {
  const frameworksNorm = Math.min(f.frameworksAffectedCount, 4) / 4;
  const systemsNorm = Math.min(f.affectedSystemsCount, 5) / 5;
  const impact = Math.max(f.impactWeight, f.exploitabilityWeight);

  const score =
    RISK_WEIGHTS.severity * f.severityWeight +
    RISK_WEIGHTS.controlCriticality * f.controlCriticality +
    RISK_WEIGHTS.impact * impact +
    RISK_WEIGHTS.evidenceUncertainty * (1 - f.evidenceConfidence) +
    RISK_WEIGHTS.frameworksAffected * frameworksNorm +
    RISK_WEIGHTS.affectedSystems * systemsNorm +
    RISK_WEIGHTS.conflictBonus * (f.hasConflictingEvidence ? 1 : 0);

  return Math.round(Math.min(100, score * f.applicabilityWeight));
}

export function severityFromScore(score: number): Severity {
  if (score >= 75) return 'CRITICAL';
  if (score >= 55) return 'HIGH';
  if (score >= 35) return 'MEDIUM';
  if (score >= 15) return 'LOW';
  return 'INFORMATIONAL';
}

/** How load-bearing each control is, independent of any one finding —
 * used as the `controlCriticality` input above. */
export const CONTROL_CRITICALITY: Record<string, number> = {
  'human-oversight': 0.95,
  'agent-kill-switch': 0.95,
  'agent-human-approval': 0.9,
  'data-leakage-prevention': 0.9,
  'incident-response': 0.85,
  'agent-least-privilege': 0.85,
  'prompt-injection-defense': 0.8,
  'record-keeping-logging': 0.75,
  'agent-tool-governance': 0.75,
  'agent-identity-auth': 0.75,
  'cybersecurity': 0.75,
  'risk-management': 0.7,
  'accuracy-robustness': 0.65,
  'change-management': 0.65,
  'post-market-monitoring': 0.6,
  'model-security': 0.6,
  'data-governance': 0.55,
  'accountability-ownership': 0.5,
  'technical-documentation': 0.45,
  'quality-management': 0.45,
  'lifecycle-management': 0.4,
  'supplier-vendor-management': 0.4,
  'transparency': 0.4,
  'ai-literacy-training': 0.3,
};

export function controlCriticality(controlId: string): number {
  return CONTROL_CRITICALITY[controlId] ?? 0.5;
}
