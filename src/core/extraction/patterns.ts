import type { ControlId, EvidenceType, Polarity } from '../types';

/**
 * Deterministic pattern layer. This is what lets the finding engine make
 * decisions without depending on an LLM: every control/evidence-type/
 * polarity/expectation match below is a plain keyword or regex rule that
 * a reviewer can read, test and extend.
 *
 * An LLM (see ../llm) may ADD extra classification tags to an Evidence
 * item after this pass runs, but it can never remove or override what
 * this deterministic pass already decided. See core/engine/README notes.
 */

// --- Control keyword rules --------------------------------------------

export const CONTROL_KEYWORDS: Record<ControlId, string[]> = {
  'human-oversight': ['human oversight', 'human review', 'operator review', 'human intervention', 'override', 'human-in-the-loop', 'human approval', 'reviewed by a human', 'manual review', 'may review', 'recommendations before', 'senior reviewer', 'operators may'],
  'risk-management': ['risk assessment', 'risk management', 'risk register', 'risk treatment', 'residual risk', 'risk owner'],
  'data-governance': ['data governance', 'data quality', 'training data', 'dataset', 'data lineage', 'data provenance', 'bias testing', 'personal data', 'pii'],
  'technical-documentation': ['technical documentation', 'model card', 'system architecture', 'architecture document', 'intended purpose', 'system description'],
  'record-keeping-logging': ['logging', 'log retention', 'audit log', 'event log', 'record-keeping', 'record keeping', 'automatically logs', 'log entry'],
  transparency: ['disclosure', 'transparency', 'inform users', 'notice to users', 'instructions for use', 'ai-generated', 'interacting with an ai'],
  'accuracy-robustness': ['accuracy', 'robustness', 'resilience', 'performance metric', 'error rate', 'fallback behavior', 'degrade gracefully'],
  cybersecurity: ['cybersecurity', 'security control', 'access control', 'encryption', 'vulnerability', 'penetration test'],
  'quality-management': ['quality management', 'qms', 'quality assurance', 'documented process'],
  'post-market-monitoring': ['post-market monitoring', 'post-deployment monitoring', 'production monitoring', 'performance monitoring', 'drift detection', 'ongoing monitoring'],
  'incident-response': ['incident response', 'incident procedure', 'serious incident', 'malfunction', 'incident escalation', 'root cause analysis', 'post-incident review'],
  'change-management': ['change management', 'change control', 'change approval', 'rollback', 'version control', 'release process'],
  'accountability-ownership': ['accountable', 'ownership', 'responsible party', 'raci', 'owner:', 'process owner', 'system owner'],
  'supplier-vendor-management': ['vendor assessment', 'third-party', 'supplier', 'vendor risk', 'subprocessor'],
  'lifecycle-management': ['lifecycle', 'decommission', 'retirement plan', 'stage-gate'],
  'ai-literacy-training': ['ai literacy', 'training program', 'staff training', 'competency requirement'],
  'agent-identity-auth': ['agent identity', 'service identity', 'agent authentication', 'client credential', 'service account', 'agent auth'],
  'agent-least-privilege': ['least privilege', 'least-privilege', 'scoped permission', 'minimum necessary access', 'permission manifest'],
  'agent-tool-governance': ['tool registry', 'tool permission', 'allowed tools', 'tool allow-list', 'dangerous tool', 'input validation', 'output validation'],
  'agent-human-approval': ['approval gate', 'requires approval', 'human approval', 'authorization required', 'approve before', 'sign-off required'],
  'agent-kill-switch': ['kill switch', 'safe-stop', 'safe stop', 'emergency stop', 'halt the agent', 'stop mechanism', 'circuit breaker'],
  'prompt-injection-defense': ['prompt injection', 'instruction isolation', 'untrusted input', 'content isolation', 'jailbreak'],
  'model-security': ['model security', 'api security', 'rate limit', 'model extraction', 'endpoint protection'],
  'data-leakage-prevention': ['data leakage', 'data exfiltration', 'output filtering', 'redaction', 'sensitive data disclosure'],
};

// --- Polarity detection --------------------------------------------------

const NEGATIVE_PATTERNS: RegExp[] = [
  /\bmust not\b/i, /\bshall not\b/i, /\bmay not\b/i, /\bprohibited\b/i, /\bnot permitted\b/i,
  /\bno access\b/i, /\bnot allowed\b/i, /\bforbidden\b/i, /\bdisallowed\b/i, /\bcannot\b/i,
  /\bwill not\b/i, /\bis not required\b/i, /\bwithout (?:human|operator) (?:review|approval)\b/i,
];

const CONDITIONAL_PATTERNS: RegExp[] = [
  /\bmay\b/i, /\bcan optionally\b/i, /\bwhere (?:applicable|feasible|possible)\b/i,
  /\bif (?:required|necessary|available)\b/i, /\bat the discretion of\b/i,
];

const AFFIRMATIVE_PATTERNS: RegExp[] = [
  /\bmust\b/i, /\bshall\b/i, /\brequired\b/i, /\bwill\b/i, /\bis granted\b/i, /\bhas access\b/i,
  /\bautomatically\b/i, /\ballows?\b/i, /\benables?\b/i, /\baccess:\s*(read|write|admin)/i,
];

export function detectPolarity(text: string): Polarity {
  const negative = NEGATIVE_PATTERNS.some((re) => re.test(text));
  if (negative) return 'negative';
  const conditional = CONDITIONAL_PATTERNS.some((re) => re.test(text));
  const affirmative = AFFIRMATIVE_PATTERNS.some((re) => re.test(text));
  if (affirmative && !conditional) return 'affirmative';
  if (conditional) return 'conditional';
  return 'neutral';
}

// --- Evidence type heuristics --------------------------------------------

interface EvidenceTypeRule {
  type: EvidenceType;
  test: (text: string, ctx: { fileType: string; section?: string }) => boolean;
}

const EVIDENCE_TYPE_RULES: EvidenceTypeRule[] = [
  { type: 'configuration', test: (t, ctx) => ctx.fileType === 'yaml' || ctx.fileType === 'json' || /^\s*[\w.-]+:\s*$/m.test(t) || /permissions:|tools:|access:/i.test(t) },
  { type: 'incident_record', test: (t) => /\bincident\b.*\b(occurred|detected|reported|resolved)\b/i.test(t) || /\bpost-incident\b/i.test(t) },
  { type: 'test_result', test: (t) => /\btest (?:result|report|passed|failed)\b/i.test(t) || /\bpass rate\b/i.test(t) },
  { type: 'approval', test: (t) => /\bapproved by\b/i.test(t) || /\bsign-?off\b/i.test(t) || /\bauthorized by\b/i.test(t) },
  { type: 'risk_assessment', test: (t) => /\brisk (?:assessment|register|score|rating)\b/i.test(t) },
  { type: 'monitoring_mechanism', test: (t) => /\bmonitor(?:s|ed|ing)?\b/i.test(t) && !/\blog/i.test(t) },
  { type: 'logging_mechanism', test: (t) => /\blog(?:s|ged|ging)?\b/i.test(t) },
  { type: 'responsibility_assignment', test: (t) => /\b(owner|responsible|accountable)\b\s*[:\-]/i.test(t) || /\bis responsible for\b/i.test(t) },
  { type: 'training_requirement', test: (t) => /\btraining\b/i.test(t) && /\b(staff|operator|personnel|role)\b/i.test(t) },
  { type: 'supplier_requirement', test: (t) => /\b(vendor|supplier|third-party|subprocessor)\b/i.test(t) },
  { type: 'architectural_statement', test: (t, ctx) => /architecture|component diagram|data flow/i.test(t) || /architecture/i.test(ctx.section ?? '') },
  { type: 'procedure', test: (t) => /\b(sop|standard operating procedure|procedure)\b/i.test(t) || /^step\s*\d/im.test(t) },
  { type: 'process', test: (t) => /\bprocess\b/i.test(t) },
  { type: 'technical_implementation', test: (t) => /\bimplement(?:s|ed|ation)\b/i.test(t) },
];

export function classifyEvidenceType(text: string, ctx: { fileType: string; section?: string }): EvidenceType {
  for (const rule of EVIDENCE_TYPE_RULES) {
    if (rule.test(text, ctx)) return rule.type;
  }
  return 'policy_statement';
}

// --- Technical/organizational expectation matching ------------------------

/**
 * Synonym expansion so "override authority" in a Requirement's
 * technicalExpectations can match "operators may override the
 * recommendation" in evidence text without exact string equality.
 */
const EXPECTATION_SYNONYMS: Record<string, string[]> = {
  override: ['override', 'overrule', 'reverse the decision'],
  stop: ['stop', 'halt', 'kill switch', 'safe-stop', 'safe stop', 'emergency stop'],
  escalation: ['escalate', 'escalation', 'escalated to'],
  authorization: ['authoriz', 'approval', 'sign-off', 'signed off', 'approved by'],
  audit: ['audit trail', 'logged', 'log of', 'record of interventions'],
  training: ['train', 'competency', 'literacy'],
  logging: ['log', 'logged', 'logging'],
  monitoring: ['monitor'],
  rollback: ['rollback', 'roll back', 'revert'],
  version: ['version control', 'versioned', 'version history'],
  test: ['test', 'tested', 'testing'],
  owner: ['owner', 'accountable', 'responsible party'],
  approval: ['approval', 'approved', 'sign-off', 'authorized'],
  identity: ['identity', 'credential', 'service account'],
  permission: ['permission', 'access level', 'scope'],
  correlation: ['correlation id', 'trace id', 'request id'],
};

function tokenize(phrase: string): string[] {
  return phrase
    .toLowerCase()
    .replace(/[^a-z0-9\s/]/g, ' ')
    .split(/[\s/]+/)
    .filter((w) => w.length > 3);
}

/** Returns true if `evidenceText` gives reasonable coverage of `expectation`. */
export function expectationIsMet(expectation: string, evidenceText: string): boolean {
  const lower = evidenceText.toLowerCase();
  const tokens = tokenize(expectation);
  if (tokens.length === 0) return false;
  let hits = 0;
  for (const token of tokens) {
    const synonyms = EXPECTATION_SYNONYMS[token] ?? [token];
    if (synonyms.some((syn) => lower.includes(syn))) hits += 1;
  }
  return hits / tokens.length >= 0.5;
}

export function anyExpectationEvidence(expectation: string, evidenceTexts: string[]): boolean {
  return evidenceTexts.some((t) => expectationIsMet(expectation, t));
}
