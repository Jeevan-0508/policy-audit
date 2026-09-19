import type { FrameworkId, FrameworkMeta, Requirement } from '../types';
import { EU_AI_ACT_REQUIREMENTS } from './eu-ai-act';
import { ISO_42001_REQUIREMENTS } from './iso-42001';
import { ISO_23894_REQUIREMENTS } from './iso-23894';
import { NIST_AI_RMF_REQUIREMENTS } from './nist-ai-rmf';
import { AI_SECURITY_REQUIREMENTS } from './ai-security';
import { AGENT_GOVERNANCE_REQUIREMENTS } from './agent-governance';

export { CONTROLS, CONTROL_LIST } from './controls';

export const FRAMEWORK_META: Record<FrameworkId, FrameworkMeta> = {
  'eu-ai-act': {
    id: 'eu-ai-act',
    name: 'EU Artificial Intelligence Act',
    shortName: 'EU AI Act',
    version: 'Regulation (EU) 2024/1689',
    description: 'Risk-tiered EU regulation for AI systems: prohibited practices, high-risk obligations, transparency, GPAI.',
    referenceUrl: 'https://artificialintelligenceact.eu/',
  },
  'iso-42001': {
    id: 'iso-42001',
    name: 'ISO/IEC 42001:2023 — AI Management System',
    shortName: 'ISO 42001',
    version: '2023',
    description: 'Management-system standard for governing AI across an organization: leadership, risk, lifecycle, operations.',
    referenceUrl: 'https://www.iso.org/standard/81230.html',
  },
  'iso-23894': {
    id: 'iso-23894',
    name: 'ISO/IEC 23894:2023 — AI Risk Management',
    shortName: 'ISO 23894',
    version: '2023',
    description: 'Guidance on integrating risk management into AI-related activities and functions.',
    referenceUrl: 'https://www.iso.org/standard/77304.html',
  },
  'nist-ai-rmf': {
    id: 'nist-ai-rmf',
    name: 'NIST AI Risk Management Framework 1.0',
    shortName: 'NIST AI RMF',
    version: '1.0',
    description: 'GOVERN / MAP / MEASURE / MANAGE functions for trustworthy AI risk management.',
    referenceUrl: 'https://www.nist.gov/itl/ai-risk-management-framework',
  },
  'ai-security': {
    id: 'ai-security',
    name: 'AI Security Controls (OWASP LLM/Agentic + MITRE ATLAS synthesis)',
    shortName: 'AI Security',
    version: '2024',
    description: 'Security controls for LLM and agentic AI systems synthesized from OWASP and MITRE ATLAS concepts.',
    referenceUrl: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
  },
  'agent-governance': {
    id: 'agent-governance',
    name: 'Agentic / Multi-Agent Governance Model',
    shortName: 'Agent Governance',
    version: '1.0',
    description: 'POLICY//AUDIT\u2019s own control model for identity, least privilege, tool governance, approval, kill switch, logging, monitoring, incident and change management in agentic systems.',
    referenceUrl: '',
  },
};

export const ALL_REQUIREMENTS: Requirement[] = [
  ...EU_AI_ACT_REQUIREMENTS,
  ...ISO_42001_REQUIREMENTS,
  ...ISO_23894_REQUIREMENTS,
  ...NIST_AI_RMF_REQUIREMENTS,
  ...AI_SECURITY_REQUIREMENTS,
  ...AGENT_GOVERNANCE_REQUIREMENTS,
];

export const REQUIREMENTS_BY_FRAMEWORK: Record<FrameworkId, Requirement[]> = {
  'eu-ai-act': EU_AI_ACT_REQUIREMENTS,
  'iso-42001': ISO_42001_REQUIREMENTS,
  'iso-23894': ISO_23894_REQUIREMENTS,
  'nist-ai-rmf': NIST_AI_RMF_REQUIREMENTS,
  'ai-security': AI_SECURITY_REQUIREMENTS,
  'agent-governance': AGENT_GOVERNANCE_REQUIREMENTS,
};

export function getRequirementById(id: string): Requirement | undefined {
  return ALL_REQUIREMENTS.find((r) => r.id === id);
}

export function getRequirementsByControl(controlId: string): Requirement[] {
  return ALL_REQUIREMENTS.filter((r) => r.controlIds.includes(controlId as never));
}
