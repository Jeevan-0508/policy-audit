import type { ControlId, Evidence, EvidenceChunk } from '../types';
import { CONTROL_KEYWORDS, classifyEvidenceType, detectPolarity } from './patterns';

function matchControls(text: string): ControlId[] {
  const lower = text.toLowerCase();
  const matched: ControlId[] = [];
  for (const [controlId, keywords] of Object.entries(CONTROL_KEYWORDS) as [ControlId, string[]][]) {
    if (keywords.some((kw) => lower.includes(kw))) matched.push(controlId);
  }
  return matched;
}

function extractKeyStatement(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) return text.slice(0, 220).trim();
  const best = sentences.reduce((a, b) => (b.length > a.length ? b : a), sentences[0]);
  return best.trim().slice(0, 320);
}

function extractTags(text: string, fileType: string): string[] {
  const tags: string[] = [];
  const agentMatch = text.match(/\b([A-Z][a-zA-Z]*Agent)\b/g);
  if (agentMatch) tags.push(...new Set(agentMatch));
  if (/\bpii\b|personal data/i.test(text)) tags.push('pii');
  if (/\bfinancial\b|\bpayment\b|\bclaim(s)?\b/i.test(text)) tags.push('financial');
  if (fileType === 'yaml' || fileType === 'json') tags.push('configuration-source');
  return [...new Set(tags)];
}

/**
 * Deterministic classification pass (spec section 25: LLM never determines
 * the verdict directly). This is the ONLY function that turns a raw
 * EvidenceChunk into a typed Evidence item used by the finding engine.
 * An LLM provider may call `applyLlmTags` afterwards to add supplementary
 * tags/control hints, but confidence and the base classification always
 * come from here first.
 */
export function classifyChunk(chunk: EvidenceChunk, fileType: string): Evidence {
  const controlIds = matchControls(chunk.text);
  const evidenceType = classifyEvidenceType(chunk.text, { fileType, section: chunk.section });
  const polarity = detectPolarity(chunk.text);
  const keyStatement = extractKeyStatement(chunk.text);
  const tags = extractTags(chunk.text, fileType);

  let confidence = 0.55;
  if (controlIds.length > 0) confidence += 0.15;
  if (controlIds.length > 1) confidence += 0.05;
  if (polarity !== 'neutral') confidence += 0.1;
  if (evidenceType !== 'policy_statement') confidence += 0.05;
  confidence = Math.min(0.95, confidence) * chunk.extractionConfidence;

  return {
    ...chunk,
    evidenceType,
    controlIds,
    polarity,
    keyStatement,
    tags,
    confidence: Math.round(confidence * 100) / 100,
    classificationMethod: 'deterministic',
  };
}

export function classifyChunks(chunks: EvidenceChunk[], fileType: string): Evidence[] {
  return chunks.map((c) => classifyChunk(c, fileType));
}
