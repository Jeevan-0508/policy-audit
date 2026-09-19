/**
 * Core data model for POLICY//AUDIT.
 *
 * Translation chain this file encodes:
 *   Regulation -> Requirement -> Control -> Technical Expectation
 *   -> Document Evidence -> Status (Support/Partial/Missing/Conflict)
 *   -> Finding -> Risk -> Remediation
 *
 * Every type here carries provenance. Nothing is allowed to reach a
 * Finding without a traceable EvidenceRef chain back to source text.
 */

export type FrameworkId =
  | 'eu-ai-act'
  | 'iso-42001'
  | 'iso-23894'
  | 'nist-ai-rmf'
  | 'ai-security'
  | 'agent-governance';

export interface FrameworkMeta {
  id: FrameworkId;
  name: string;
  shortName: string;
  version: string;
  description: string;
  /** Public reference for the framework, not a reproduction of its text. */
  referenceUrl: string;
}

/**
 * Normalized control ontology. This is the crosswalk backbone: one Control
 * can be required by many Requirements across many frameworks, and one
 * piece of Evidence can satisfy many Controls at once.
 */
export type ControlId =
  | 'human-oversight'
  | 'risk-management'
  | 'data-governance'
  | 'technical-documentation'
  | 'record-keeping-logging'
  | 'transparency'
  | 'accuracy-robustness'
  | 'cybersecurity'
  | 'quality-management'
  | 'post-market-monitoring'
  | 'incident-response'
  | 'change-management'
  | 'accountability-ownership'
  | 'supplier-vendor-management'
  | 'lifecycle-management'
  | 'ai-literacy-training'
  | 'agent-identity-auth'
  | 'agent-least-privilege'
  | 'agent-tool-governance'
  | 'agent-human-approval'
  | 'agent-kill-switch'
  | 'prompt-injection-defense'
  | 'model-security'
  | 'data-leakage-prevention';

export interface Control {
  id: ControlId;
  name: string;
  category: 'governance' | 'risk' | 'technical' | 'security' | 'agentic';
  description: string;
}

export type EvidenceType =
  | 'policy_statement'
  | 'technical_implementation'
  | 'responsibility_assignment'
  | 'process'
  | 'control'
  | 'monitoring_mechanism'
  | 'logging_mechanism'
  | 'test_result'
  | 'incident_record'
  | 'approval'
  | 'configuration'
  | 'risk_assessment'
  | 'architectural_statement'
  | 'procedure'
  | 'training_requirement'
  | 'supplier_requirement';

export type Polarity = 'affirmative' | 'negative' | 'conditional' | 'neutral';

export type SupportedFileType = 'pdf' | 'docx' | 'xlsx' | 'csv' | 'txt' | 'md' | 'json' | 'yaml';

export interface GovDocument {
  id: string;
  filename: string;
  fileType: SupportedFileType;
  sizeBytes: number;
  hash: string;
  uploadedAt: string;
  pageCount?: number;
  /** Set when the injection scanner found instruction-like content in the file. */
  injectionFlags: InjectionFlag[];
}

export interface InjectionFlag {
  snippet: string;
  page?: number;
  reason: string;
}

/** Raw extracted unit before semantic classification. Provenance is mandatory. */
export interface EvidenceChunk {
  id: string;
  documentId: string;
  documentName: string;
  page?: number;
  section?: string;
  paragraphRef?: string;
  text: string;
  extractionConfidence: number;
  extractedAt: string;
}

/** A chunk after deterministic + optional-LLM classification. */
export interface Evidence extends EvidenceChunk {
  evidenceType: EvidenceType;
  controlIds: ControlId[];
  polarity: Polarity;
  /** Short human-readable statement pulled from the text (the quoted excerpt). */
  keyStatement: string;
  tags: string[];
  confidence: number;
  classificationMethod: 'deterministic' | 'llm-assisted';
}

export interface Requirement {
  id: string;
  framework: FrameworkId;
  reference: string;
  title: string;
  domain: string;
  applicability: string;
  controlObjective: string;
  controlIds: ControlId[];
  expectedEvidence: string[];
  technicalExpectations: string[];
  organizationalExpectations: string[];
  relatedRequirementIds: string[];
  version: string;
  effectiveDate: string;
  source: string;
}

export type FindingType =
  | 'MISSING'
  | 'PARTIAL'
  | 'CONFLICT'
  | 'IMPLEMENTATION_GAP'
  | 'OWNERSHIP_GAP'
  | 'MONITORING_GAP'
  | 'LOGGING_GAP'
  | 'HUMAN_OVERSIGHT_GAP'
  | 'INCIDENT_GAP'
  | 'CHANGE_GAP'
  | 'SECURITY_GAP'
  | 'EVIDENCE_GAP';

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type RequirementStatus = 'SUPPORTED' | 'PARTIAL' | 'MISSING';

export interface RiskFactors {
  severityWeight: number;
  applicabilityWeight: number;
  evidenceConfidence: number;
  controlCriticality: number;
  impactWeight: number;
  exploitabilityWeight: number;
  affectedSystemsCount: number;
  frameworksAffectedCount: number;
  hasConflictingEvidence: boolean;
}

export interface Finding {
  id: string;
  type: FindingType;
  severity: Severity;
  frameworkIds: FrameworkId[];
  requirementIds: string[];
  controlId: ControlId;
  status: RequirementStatus;
  title: string;
  evidenceIds: string[];
  missingElements: string[];
  conflictEvidenceIds?: [string, string];
  riskScore: number;
  riskFactors: RiskFactors;
  confidence: number;
  sourceDocumentIds: string[];
  reasoning: string;
  remediation: string;
  createdAt: string;
}

export interface AgentProfile {
  name: string;
  sourceDocumentIds: string[];
  sourceEvidenceIds: string[];
  tools: string[];
  externalActionsCount: number;
  piiAccess: 'YES' | 'NO' | 'UNKNOWN';
  financialAction: 'YES' | 'NO' | 'UNKNOWN';
  humanApproval: 'YES' | 'PARTIAL' | 'MISSING';
  logging: 'YES' | 'PARTIAL' | 'MISSING';
  monitoring: 'YES' | 'PARTIAL' | 'MISSING';
  killSwitch: 'YES' | 'MISSING';
  leastPrivilege: 'YES' | 'PARTIAL' | 'MISSING';
  incidentProcedure: 'YES' | 'MISSING';
}

export interface FrameworkCoverage {
  framework: FrameworkId;
  supportedPct: number;
  partialPct: number;
  missingPct: number;
  requirementCount: number;
}

export interface Contradiction {
  id: string;
  topic: ControlId;
  severity: Severity;
  documentA: { documentId: string; documentName: string; page?: number; section?: string; statement: string };
  documentB: { documentId: string; documentName: string; page?: number; section?: string; statement: string };
  conflictDescription: string;
  confidence: number;
}

export interface AuditRunStats {
  documentsAnalyzed: number;
  requirementsEvaluated: number;
  evidenceItems: number;
  findings: number;
  criticalFindings: number;
  highFindings: number;
  contradictions: number;
  implementationGaps: number;
}

export interface AuditRun {
  id: string;
  documentIds: string[];
  frameworkIds: FrameworkId[];
  startedAt: string;
  completedAt: string;
  stats: AuditRunStats;
}
