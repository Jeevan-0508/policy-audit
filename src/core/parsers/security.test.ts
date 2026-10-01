import { expect, test } from 'bun:test';
import { ingestFile } from './index';
import { parseJsonFile, parseYamlFile } from './structured';

test('recursive YAML aliases fail closed', async () => {
  await expect(parseYamlFile(new File(['root: &root\n  child: *root'], 'cycle.yaml'), 'DOC')).rejects.toThrow('Recursive aliases');
});

test('deep JSON and alias fanout have bounded expansion', async () => {
  const nested = '{"a":'.repeat(100) + '1' + '}'.repeat(100);
  await expect(parseJsonFile(new File([nested], 'deep.json'), 'DOC')).rejects.toThrow('limit');
  const aliases = 'root: &root [one, two, three]\nall: [' + Array(20_000).fill('*root').join(',') + ']';
  await expect(parseYamlFile(new File([aliases], 'fanout.yaml'), 'DOC')).rejects.toThrow('limit');
});

test('ordinary aliases preserve each source path', async () => {
  const rows = await parseYamlFile(new File(['a: &a {enabled: true}\nb: *a'], 'normal.yaml'), 'DOC');
  expect(rows.map((row) => row.section)).toEqual(['a', 'b']);
});

test('full document hash includes bytes after the old 1 MB prefix boundary', async () => {
  const prefix = 'a'.repeat(1_000_001);
  const a = await ingestFile(new File([prefix + 'A'], 'a.txt'));
  const b = await ingestFile(new File([prefix + 'B'], 'b.txt'), 'synthetic_fixture');
  expect(a.document.hash).not.toBe(b.document.hash);
  expect(a.document.hash).toMatch(/^[a-f0-9]{64}$/);
  expect(a.document.dataClass).toBe('operator_supplied');
  expect(b.document.dataClass).toBe('synthetic_fixture');
  expect(a.document.authenticity).toBe('unverified');
});
