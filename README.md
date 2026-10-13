<p align="center">
  <img src="docs/assets/policy-audit-hero.svg" alt="POLICY//AUDIT — governance evidence traced from regulation to gap" width="100%">
</p>

<p align="center">
  <a href="https://jeevan-0508.github.io/policy-audit/">Open the live product</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#run-it-locally">Run locally</a>
</p>

# POLICY//AUDIT

### Find where governance intent stops matching implementation.

POLICY//AUDIT turns a corpus of policies, architecture notes, SOPs, and configuration evidence into
an auditable set of supported, partial, missing, and conflicting findings.

It is built for people who need to review AI governance evidence without hiding the uncertainty behind
a single compliance percentage.

`LOCAL` · `DETERMINISTIC` · `NO BACKEND` · `OPEN SOURCE`

## The product in one view

<p align="center">
  <img src="docs/assets/evidence-chain.svg" alt="The POLICY//AUDIT evidence chain from regulation to control, implementation, evidence, and finding" width="100%">
</p>

<table>
<tr>
<td width="50%" valign="top">
<strong>See the evidence</strong><br>
Every result points back to the document, page or section, extracted statement, confidence, and hash.
</td>
<td width="50%" valign="top">
<strong>See the disagreement</strong><br>
Conservative contradiction checks surface policy conflicts without treating different wording as proof.
</td>
</tr>
<tr>
<td width="50%" valign="top">
<strong>See the implementation gap</strong><br>
Policy prohibitions can be compared with access grants found in YAML or JSON configuration evidence.
</td>
<td width="50%" valign="top">
<strong>Keep the human in charge</strong><br>
The system organizes evidence and findings. It does not make a legal or operational decision for you.
</td>
</tr>
</table>

## Why it matters

Governance reviews often stop at policy text or a checklist. The harder questions sit between the
documents:

- Does the architecture implement what the policy says?
- Which requirement is supported by which evidence?
- Where do two documents disagree?
- What is missing, and what should a reviewer investigate next?

POLICY//AUDIT makes those relationships visible in the browser.

## How it works

1. **Bring the evidence** — PDF, DOCX, XLSX, CSV, JSON, YAML, TXT, or Markdown.
2. **Review the findings** — coverage, contradictions, implementation gaps, severity, and agent-governance signals.
3. **Follow the trail** — every result stays connected to its source passage and document hash.

The shipped verdict path is deterministic. A future model provider may add tags, but it cannot override
classification, matching, status, severity, or finding generation.

<details>
<summary><strong>What is inside the product</strong></summary>
<br>

- Overview, Upload, Documents, Evidence, Findings, Contradictions, Requirements, Frameworks, Agent Governance, Reports, and Technical Translation screens
- Curated and paraphrased requirement families for the EU AI Act, ISO/IEC 42001, ISO/IEC 23894, NIST AI RMF, AI security, and agent governance
- Deterministic engines for classification, matching, coverage, severity, contradiction detection, implementation gaps, and agent governance profiling
- Prompt-injection scanning for untrusted document content
</details>

<details>
<summary><strong>Trust boundaries and limitations</strong></summary>
<br>

Documents are processed locally in the browser. There is no backend, account, database, or upload
service in this build. The project does not provide legal advice, establish regulatory compliance, or
claim that a missing finding proves a control is absent.

The framework content is curated and paraphrased for evidence matching. Applicability scoping is
currently assumed universal.
</details>

## Run it locally

```bash
bun install
bun run dev
```

Verification:

```bash
bun test          # 12 deterministic tests
bun run typecheck
bun run build
```

## Project status

The browser audit engine, evidence parsers, framework crosswalk, findings, contradiction checks,
implementation-gap checks, agent-governance profile, demo corpus, and core screens are implemented.

Exportable audit reports, expanded applicability scoping, and an optional BYOK enhancement layer are
not part of the shipped build.

## Related systems

[AI Governance Control Room](https://github.com/Jeevan-0508/ai-governance-control-room) ·
[RISK//SWARM](https://github.com/Jeevan-0508/risk-swarm) ·
[RISK//REPLAY](https://github.com/Jeevan-0508/risk-replay) ·
[RISK//OS](https://github.com/Jeevan-0508/risk-os) ·
[Freight Risk Atlas](https://github.com/Jeevan-0508/freight-risk-atlas)

## License

MIT
