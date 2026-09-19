let counter = 0;

/** Deterministic-enough sequential IDs so re-running an audit on the same
 * corpus in the same order produces stable, diffable IDs (useful for tests
 * and for golden-dataset assertions). */
export function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${String(counter).padStart(5, '0')}`;
}

export function resetIdCounter(): void {
  counter = 0;
}

/** Simple, fast, deterministic string hash (FNV-1a) — good enough for a
 * document-content fingerprint; not a cryptographic hash. */
export function fnv1aHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
