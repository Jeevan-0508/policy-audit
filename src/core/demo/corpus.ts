/**
 * Golden demo corpus (spec follow-up: "Not started: demo corpus").
 *
 * A small, internally consistent fixture set for a fictional claims-processing
 * agent, ClaimsAgent. Every sentence here is deliberately written to be
 * classified by the REAL deterministic engine in ../extraction and
 * ../engine, not hand-injected findings: the engine decides what is
 * SUPPORTED, PARTIAL or MISSING, where the contradiction is, and where the
 * policy/implementation gap is, exactly as it would for a real upload.
 */

export interface DemoFile {
  filename: string;
  content: string;
}

const AI_GOVERNANCE_POLICY = `# AI GOVERNANCE POLICY

## 1 Purpose and Scope

This policy establishes governance requirements for all AI and autonomous agent
systems, including ClaimsAgent, deployed by the organization. It defines
requirements for risk management, human oversight, transparency, logging and
incident response prior to production deployment.

## 2 Human Oversight

All high-risk decisions require human approval before being finalized. A
human reviewer must retain override authority over any automated
recommendation, and operators may override the system's output at any time.
Every human intervention is logged as part of the audit trail.

## 3 Risk Management

The organization maintains a risk register documenting risk assessment, risk
treatment and residual risk for every AI system. The Risk Manager is the
accountable process owner (RACI: Owner) for this risk register and reviews
it quarterly.

## 4 Data Governance

Training data used by any AI system undergoes bias testing and dataset
lineage tracking prior to release, and data quality checks are re-run on
every retraining cycle. Personal data (PII) processed by an agent must be
identified in its data flow documentation.

## 5 Data Access Restrictions

ClaimsAgent and all other autonomous agents are prohibited from accessing
production customer data or payment card data without explicit written
authorization from the Risk Manager. This restriction applies regardless of
the tool integration in use.

## 6 Transparency

Users are given notice that they are interacting with an AI system, and
instructions for use are published in the user-facing manual. AI-generated
recommendations are disclosed as such before a human reviewer signs off.

## 7 Logging and Record-Keeping

Every agent action is captured in an audit log with log retention of at
least 400 days. Each log entry includes a timestamp and the reviewer's
sign-off.

## 8 Incident Response

A documented incident response procedure exists for any serious incident or
malfunction. Every incident triggers a root cause analysis and a
post-incident review within five business days.

## 9 Change Management

All changes to a production AI system go through a change approval process,
including a documented rollback procedure and version control of the
deployed model and configuration.

## 10 Cybersecurity

Access control, encryption of data at rest, and a penetration test schedule
are maintained for every AI system's supporting infrastructure. Known
vulnerabilities are remediated according to severity.

## 11 Accuracy and Robustness

Each system's error rate and accuracy are tracked against a defined
performance metric, with a fallback behavior defined so the system can
degrade gracefully rather than fail silently.

## 12 AI Literacy and Training

Staff training on AI literacy is mandatory annually and forms part of the
competency requirement for every operator interacting with an AI system.

## 13 Quality Management

The organization maintains a documented process quality management system
(QMS) covering the AI development lifecycle from design through
decommission.

## 14 Supplier and Vendor Management

Any third-party vendor or subprocessor providing AI components undergoes a
vendor risk assessment before onboarding and annually thereafter.

## 15 Lifecycle Management

Every AI system has a defined lifecycle plan, including a decommission and
retirement plan reviewed at least once a year.
`;

const CLAIMSAGENT_ARCHITECTURE = `# CLAIMSAGENT SYSTEM ARCHITECTURE

## System Overview

This system architecture document describes ClaimsAgent's intended purpose:
triaging incoming insurance claims, verifying policy details, and either
recommending or auto-processing a payout. ClaimsAgent processes personal
data (PII) such as claimant name, address and policy number during claims
intake, in addition to payment card data for reimbursement.

## Approval Workflow

Claims below $10,000 are automatically approved without human review, while
claims at or above this threshold are routed to a human reviewer for
sign-off. ClaimsAgent makes an API call to the payment processor to transfer
funds for approved claims.

## Production Monitoring

ClaimsAgent's production monitoring includes drift detection on model
outputs. When drift crosses the alert threshold, the system automatically
alerts the operator and pauses new claim submissions pending review.

## Notifications

After a decision is recorded, ClaimsAgent sends an email notification to the
claimant via the email notification service, closing the loop on the claim
lifecycle.
`;

const CLAIMSAGENT_CONFIG_YAML = `agent: ClaimsAgent
description: >
  Configuration for the ClaimsAgent claims-processing pipeline. Handles PII
  and payment card data during claims intake and reimbursement.

primary_tool: production_customer_database
secondary_tool: payment_processor_api
tertiary_tool: email_notification_service

permissions:
  production_customer_database:
    access: read
  payment_processor_api:
    access: write
  email_notification_service:
    access: write
`;

const CLAIMSAGENT_OPERATIONS_SOP = `# CLAIMSAGENT OPERATIONS SOP

## Human Approval Gate

ClaimsAgent enforces an approval gate for any claim at or above $10,000: the
workflow blocks execution until a senior reviewer provides explicit
sign-off, and the decision plus reviewer identity are logged.

## Logging

Every ClaimsAgent decision is written to a structured log entry that
records the outcome and the reviewer's identity, and log retention is 400
days.

## Least Privilege

ClaimsAgent operates under a least-privilege permission manifest: the
production customer database grant is read-only, limited to minimum
necessary access for claims verification, and any change to scope requires
a new permission manifest review.

## Kill Switch

ClaimsAgent has a tested kill switch (safe-stop) that any on-call engineer
can trigger to immediately halt the agent; the mechanism was last tested
during the Q2 incident response drill.

## Incident Procedure

ClaimsAgent's incident procedure defines an escalation SLA of 30 minutes for
any detected anomaly, and every serious incident triggers a root cause
analysis and a post-incident review within five business days.
`;

const SECURITY_AND_AGENT_GOVERNANCE_NOTES = `# CLAIMSAGENT SECURITY AND AGENT GOVERNANCE NOTES

## Agent Identity

ClaimsAgent authenticates to internal services using a dedicated service
account and client credential; each agent identity is distinct from human
user accounts.

## Tool Governance

All tools available to ClaimsAgent are registered in a tool registry with
an explicit tool allow-list. Dangerous tools such as direct database writes
are excluded, and every tool call passes through input validation and
output validation before execution.

## Prompt Injection Defense

ClaimsAgent's prompt handling includes instruction isolation so that
untrusted input embedded in an uploaded claim document cannot be
interpreted as a new instruction, mitigating prompt injection and jailbreak
attempts.

## Model and API Security

API access to ClaimsAgent's endpoints is rate limited, and the underlying
model is protected against model extraction attempts through endpoint
protection controls. Regular model security reviews are performed.

## Data Leakage Prevention

Output sent to claimants is passed through output filtering and redaction
to prevent sensitive data disclosure or data leakage of other claimants'
records.
`;

export const DEMO_FILES: DemoFile[] = [
  { filename: 'ai-governance-policy.md', content: AI_GOVERNANCE_POLICY },
  { filename: 'claimsagent-architecture.md', content: CLAIMSAGENT_ARCHITECTURE },
  { filename: 'claimsagent-config.yaml', content: CLAIMSAGENT_CONFIG_YAML },
  { filename: 'claimsagent-operations-sop.md', content: CLAIMSAGENT_OPERATIONS_SOP },
  { filename: 'security-and-agent-governance-notes.md', content: SECURITY_AND_AGENT_GOVERNANCE_NOTES },
];

/** Turns the fixture strings into real File objects, run through the exact
 * same ingestFile/runAudit pipeline as a user upload, no special-cased
 * demo path in the engine. */
export function buildDemoFiles(): File[] {
  return DEMO_FILES.map((f) => new File([f.content], f.filename, { type: 'text/plain' }));
}
