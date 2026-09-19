import yaml from 'js-yaml';
import type { EvidenceChunk } from '../types';
import { nextId } from '../engine/ids';

/** Flattens a parsed JSON/YAML object into leaf-level chunks so structural
 * provenance (key path) is preserved — critical for the policy-vs-config
 * implementation gap engine, which reads exactly this kind of evidence. */
function flatten(value: unknown, path: string, out: { path: string; text: string }[]): void {
  if (value === null || value === undefined) return;
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')) {
      out.push({ path, text: `${path}: [${value.join(', ')}]` });
      return;
    }
    value.forEach((v, i) => flatten(v, `${path}[${i}]`, out));
    return;
  }
  if (typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const nextPath = path ? `${path}.${k}` : k;
      if (v !== null && typeof v === 'object') {
        flatten(v, nextPath, out);
      } else {
        out.push({ path: nextPath, text: `${nextPath}: ${String(v)}` });
      }
    }
    return;
  }
  out.push({ path, text: `${path}: ${String(value)}` });
}

function chunksFromParsed(parsed: unknown, documentId: string, documentName: string): EvidenceChunk[] {
  const leaves: { path: string; text: string }[] = [];
  flatten(parsed, '', leaves);

  // Group leaves under their top-level key so an agent config's tool list
  // and permission map stay together as one evidence statement instead of
  // exploding into one chunk per scalar.
  const groups = new Map<string, string[]>();
  for (const leaf of leaves) {
    const topKey = leaf.path.split(/[.[]/)[0] || leaf.path;
    if (!groups.has(topKey)) groups.set(topKey, []);
    groups.get(topKey)!.push(leaf.text);
  }

  const chunks: EvidenceChunk[] = [];
  for (const [topKey, lines] of groups) {
    chunks.push({
      id: nextId('CH'),
      documentId,
      documentName,
      section: topKey,
      paragraphRef: topKey,
      text: lines.join('\n'),
      extractionConfidence: 0.98,
      extractedAt: new Date().toISOString(),
    });
  }
  return chunks;
}

export async function parseJsonFile(file: File, documentId: string): Promise<EvidenceChunk[]> {
  const raw = await file.text();
  const parsed = JSON.parse(raw);
  return chunksFromParsed(parsed, documentId, file.name);
}

export async function parseYamlFile(file: File, documentId: string): Promise<EvidenceChunk[]> {
  const raw = await file.text();
  const parsed = yaml.load(raw);
  return chunksFromParsed(parsed, documentId, file.name);
}
