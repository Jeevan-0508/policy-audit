import yaml from 'js-yaml';
import type { EvidenceChunk } from '../types';
import { nextId } from '../engine/ids';

/** Flattens a parsed JSON/YAML object into leaf-level chunks so structural
 * provenance (key path) is preserved — critical for the policy-vs-config
 * implementation gap engine, which reads exactly this kind of evidence. */
export const STRUCTURED_LIMITS = { depth: 64, nodes: 50_000, text: 2_000_000 } as const;

/** Bound alias expansion and reject recursive YAML aliases before they can
 * exhaust the browser stack. Shared aliases are allowed only within the budget. */
function flatten(value: unknown, path: string, out: { path: string; text: string }[],
  active = new Set<object>(), budget = { nodes: 0, text: 0 }, depth = 0): void {
  if (++budget.nodes > STRUCTURED_LIMITS.nodes || depth > STRUCTURED_LIMITS.depth) {
    throw new Error('Structured document exceeds the supported nesting or expansion limit');
  }
  if (value === null || value === undefined) return;
  const add = (leafPath: string, text: string) => {
    budget.text += text.length;
    if (budget.text > STRUCTURED_LIMITS.text) throw new Error('Structured document exceeds the extracted text limit');
    out.push({ path: leafPath, text });
  };
  if (typeof value === 'object') {
    if (active.has(value)) throw new Error('Recursive aliases are not supported in structured documents');
    active.add(value);
  }
  try {
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')) {
      if (budget.nodes + value.length > STRUCTURED_LIMITS.nodes) throw new Error('Structured document exceeds the expansion limit');
      budget.nodes += value.length;
      add(path, `${path}: [${value.join(', ')}]`);
      return;
    }
    value.forEach((v, i) => flatten(v, `${path}[${i}]`, out, active, budget, depth + 1));
    return;
  }
  if (typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const nextPath = path ? `${path}.${k}` : k;
      if (v !== null && typeof v === 'object') {
        flatten(v, nextPath, out, active, budget, depth + 1);
      } else {
        if (++budget.nodes > STRUCTURED_LIMITS.nodes) throw new Error('Structured document exceeds the expansion limit');
        add(nextPath, `${nextPath}: ${String(v)}`);
      }
    }
    return;
  }
  add(path, `${path}: ${String(value)}`);
  } finally {
    if (typeof value === 'object') active.delete(value);
  }
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
