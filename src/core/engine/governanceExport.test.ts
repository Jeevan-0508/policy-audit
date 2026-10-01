import { expect, test } from 'bun:test';
import { ingestFile } from '../parsers';
import { runAudit } from './audit';
import { governanceExport } from './governanceExport';

test('governance export keeps fixture class and references without disclosing source text', async () => {
  const input = await ingestFile(new File(['Secret carrier AAA: Human approval is required.'], 'private-name.txt'), 'synthetic_fixture');
  const result = runAudit([input]);
  const output = governanceExport(result);
  expect(output.source_documents[0].data_class).toBe('synthetic_fixture');
  expect(output.evidence_references.every((e) => e.data_class === 'synthetic_fixture')).toBe(true);
  expect(output.review_status).toBe('unreviewed');
  expect(output.legal_status).toBe('not_determined');
  const text = JSON.stringify(output);
  expect(text).not.toContain('Secret carrier AAA');
  expect(text).not.toContain('private-name.txt');
  expect(output.requirements.every((r) => r.text_kind === 'curated_interpretation')).toBe(true);
  result.evidence[0].documentId = 'MISSING';
  expect(() => governanceExport(result)).toThrow('absent document');
});
