import type { AuditResult } from './audit';

/** Metadata-only interchange. No document excerpts, names, agent configs or
 * generated legal conclusions leave the browser in this export. */
export function governanceExport(result: AuditResult) {
  const documents = new Map(result.documents.map((d) => [d.id, d]));
  const evidence = new Map(result.evidence.map((e) => [e.id, e]));
  for (const item of result.evidence) {
    if (!documents.has(item.documentId)) throw new Error('Evidence references an absent document');
  }
  for (const finding of result.findings) {
    if (finding.evidenceIds.some((id) => !evidence.has(id))) throw new Error('Finding references absent evidence');
  }
  return {
    schema_version: 'policy-audit-governance.v1',
    generated_at: new Date().toISOString(),
    producer: 'policy-audit',
    assessment_kind: 'deterministic_document_heuristic',
    review_status: 'unreviewed',
    legal_status: 'not_determined',
    method: 'Keyword/pattern matches identify possible governance gaps. Uploaded text and fixture text are unverified. Missing matches do not prove missing controls, and matches do not prove compliance.',
    run: result.run,
    source_documents: result.documents.map((d) => ({
      id: d.id, sha256: d.hash, hash_algorithm: d.hashAlgorithm,
      data_class: d.dataClass, authenticity: d.authenticity,
      collected_at: d.uploadedAt, size_bytes: d.sizeBytes,
    })),
    evidence_references: result.evidence.map((e) => ({
      id: e.id, document_id: e.documentId, page: e.page ?? null,
      data_class: documents.get(e.documentId)!.dataClass,
      extracted_at: e.extractedAt, extraction_method: e.classificationMethod,
      control_ids: e.controlIds,
    })),
    requirements: result.requirements.map((r) => ({
      id: r.id, framework: r.framework, reference: r.reference,
      title: r.title, source_url: r.source, version: r.version,
      declared_effective_date: r.effectiveDate, control_ids: r.controlIds,
      text_kind: 'curated_interpretation', currency: 'not_checked_at_export',
    })),
    findings: result.findings.map((f) => ({
      id: f.id, type: f.type, control_id: f.controlId, requirement_ids: f.requirementIds,
      evidence_ids: f.evidenceIds, status: f.status, severity: f.severity,
      claim_kind: 'heuristic_interpretation', uncertainty: 'requires_source_and_human_review',
    })),
    coverage: result.coverage,
  } as const;
}
