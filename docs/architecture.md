# POLICY//AUDIT architecture

POLICY//AUDIT is a browser-first React application. Its core audit engine is a pure TypeScript pipeline that turns uploaded documents into provenance-carrying evidence and findings.

## Runtime flow

```text
File
  -> file-type detection and size guard
  -> format parser
  -> paragraph chunking with document/page/section provenance
  -> instruction-like content scan
  -> deterministic evidence classification
  -> requirement matching
  -> coverage findings + contradiction findings + implementation-gap findings
  -> framework coverage, agent profiles, and UI reports
```

The application store in `src/app/lib/store.ts` owns the current in-memory corpus and audit result. Routes in `src/app/App.tsx` expose upload, documents, evidence, findings, contradictions, requirements, frameworks, agent governance, technical translation, and reports screens.

## Core boundaries

- Parsers create `EvidenceChunk` values; they do not decide compliance.
- `classifyChunk` assigns evidence type, polarity, controls, tags, and a deterministic confidence value.
- `matchAllRequirements` connects evidence to the normalized requirement catalogue.
- Finding builders produce coverage, contradiction, and implementation-gap findings.
- The audit engine sorts findings by risk score and records run statistics.
- Optional LLM assistance is not wired into the default run path and cannot override the deterministic verdict in the current application.

## Data model

The main types are in `src/core/types.ts`. The provenance chain is:

```text
GovDocument -> EvidenceChunk -> Evidence -> Requirement match -> Finding
```

Findings retain evidence IDs, source document IDs, requirement IDs, control IDs, risk factors, confidence, reasoning, and remediation text.

## Framework mapping

Framework metadata and requirements live in `src/core/frameworks/`. The current catalogue includes EU AI Act, ISO/IEC 42001, ISO/IEC 23894, NIST AI RMF, AI security, and agent governance requirements. These are portfolio mappings and references, not a legal determination of compliance.
