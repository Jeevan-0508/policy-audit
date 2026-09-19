import type { Control, ControlId } from '../types';

/**
 * The crosswalk backbone (spec section 13). Every Requirement in every
 * framework KB points at one or more of these. The finding engine and
 * coverage calculators key off ControlId, not framework text, which is
 * what lets one piece of evidence satisfy several frameworks at once
 * without duplicating it.
 */
export const CONTROLS: Record<ControlId, Control> = {
  'human-oversight': {
    id: 'human-oversight',
    name: 'Human Oversight & Intervention',
    category: 'governance',
    description:
      "Humans can meaningfully understand, monitor, and intervene in an AI system's operation, including stopping it.",
  },
  'risk-management': {
    id: 'risk-management',
    name: 'AI Risk Management',
    category: 'risk',
    description: 'Systematic identification, analysis, evaluation and treatment of AI-specific risk across the lifecycle.',
  },
  'data-governance': {
    id: 'data-governance',
    name: 'Data Governance & Quality',
    category: 'governance',
    description: 'Training/validation/operational data is governed for quality, provenance, bias and lawful use.',
  },
  'technical-documentation': {
    id: 'technical-documentation',
    name: 'Technical Documentation',
    category: 'governance',
    description: 'System purpose, architecture, capabilities, limitations and performance are documented before deployment.',
  },
  'record-keeping-logging': {
    id: 'record-keeping-logging',
    name: 'Record-Keeping & Logging',
    category: 'technical',
    description: 'System operation, decisions and events are automatically logged with sufficient traceability.',
  },
  transparency: {
    id: 'transparency',
    name: 'Transparency & User Disclosure',
    category: 'governance',
    description: 'People interacting with or affected by the system are informed of its use, nature and limitations.',
  },
  'accuracy-robustness': {
    id: 'accuracy-robustness',
    name: 'Accuracy, Robustness & Resilience',
    category: 'technical',
    description: 'The system performs to a defined accuracy bar and degrades safely under error, drift or adversarial input.',
  },
  cybersecurity: {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    category: 'security',
    description: 'The system and its supply chain are protected against unauthorized access, manipulation and abuse.',
  },
  'quality-management': {
    id: 'quality-management',
    name: 'Quality Management System',
    category: 'governance',
    description: 'Documented, repeatable processes govern design, development, testing, deployment and change.',
  },
  'post-market-monitoring': {
    id: 'post-market-monitoring',
    name: 'Post-Market / Post-Deployment Monitoring',
    category: 'risk',
    description: 'Real-world performance and risk are actively monitored after deployment, not just before it.',
  },
  'incident-response': {
    id: 'incident-response',
    name: 'Incident Detection & Response',
    category: 'risk',
    description: 'Serious incidents and malfunctions can be detected, escalated, contained, investigated and reported.',
  },
  'change-management': {
    id: 'change-management',
    name: 'Change & Lifecycle Management',
    category: 'governance',
    description: 'Changes to models, prompts, policies, tools or configuration are approved, tracked and reversible.',
  },
  'accountability-ownership': {
    id: 'accountability-ownership',
    name: 'Accountability & Ownership',
    category: 'governance',
    description: 'A named, accountable owner exists for each obligation, control and system decision.',
  },
  'supplier-vendor-management': {
    id: 'supplier-vendor-management',
    name: 'Supplier & Third-Party AI Management',
    category: 'governance',
    description: 'Third-party/vendor AI components are assessed, contracted and monitored for governance obligations.',
  },
  'lifecycle-management': {
    id: 'lifecycle-management',
    name: 'AI Lifecycle Management',
    category: 'governance',
    description: 'Governance activities are mapped across design, development, validation, deployment and retirement.',
  },
  'ai-literacy-training': {
    id: 'ai-literacy-training',
    name: 'AI Literacy & Operator Training',
    category: 'governance',
    description: 'Staff who build, operate or oversee the system have role-appropriate AI literacy and training.',
  },
  'agent-identity-auth': {
    id: 'agent-identity-auth',
    name: 'Agent Identity & Authentication',
    category: 'agentic',
    description: 'Every agent/service has a distinct identity and is authenticated and authorized before acting.',
  },
  'agent-least-privilege': {
    id: 'agent-least-privilege',
    name: 'Agent Least Privilege',
    category: 'agentic',
    description: 'Agents hold the minimum tool, data and action permissions needed for their task, nothing more.',
  },
  'agent-tool-governance': {
    id: 'agent-tool-governance',
    name: 'Agent Tool Governance',
    category: 'agentic',
    description: 'Tools available to an agent are enumerated, classified by risk, and input/output validated.',
  },
  'agent-human-approval': {
    id: 'agent-human-approval',
    name: 'Agent Human Approval Gate',
    category: 'agentic',
    description: 'High-impact or irreversible agent actions require an explicit, authorized human approval step.',
  },
  'agent-kill-switch': {
    id: 'agent-kill-switch',
    name: 'Agent Safe-Stop / Kill Switch',
    category: 'agentic',
    description: "An authorized operator can immediately halt an agent or multi-agent system's actions.",
  },
  'prompt-injection-defense': {
    id: 'prompt-injection-defense',
    name: 'Prompt Injection & Instruction-Isolation Defense',
    category: 'security',
    description: 'Untrusted content (documents, tool output, retrieved text) cannot alter model/agent instructions.',
  },
  'model-security': {
    id: 'model-security',
    name: 'Model & API Security',
    category: 'security',
    description: 'Model endpoints, weights and APIs are protected against abuse, extraction and adversarial manipulation.',
  },
  'data-leakage-prevention': {
    id: 'data-leakage-prevention',
    name: 'Sensitive Data Leakage Prevention',
    category: 'security',
    description: 'Confidential, personal or regulated data cannot exit the system through outputs, logs or tool calls.',
  },
};

export const CONTROL_LIST: Control[] = Object.values(CONTROLS);
