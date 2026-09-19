import { describe, expect, test } from 'bun:test';
import { buildDemoFiles } from './corpus';
import { ingestFile } from '../parsers';
import { runAudit } from '../engine/audit';

describe('demo corpus', () => {
  test('runs through the real ingestion + audit pipeline and produces a credible mixed result', async () => {
    const files = buildDemoFiles();
    const ingested = await Promise.all(files.map((f) => ingestFile(f)));
    const result = runAudit(ingested);

    expect(result.documents).toHaveLength(5);
    expect(result.evidence.length).toBeGreaterThan(10);

    // Coverage should span all six frameworks and be a genuine mix, not
    // artificially perfect: some requirements SUPPORTED, most only PARTIAL
    // (every control gets some evidence in this corpus, so nothing hits a
    // hard zero-evidence MISSING, but full expectation coverage is rare).
    expect(result.coverage).toHaveLength(6);
    const anySupported = result.coverage.some((c) => c.supportedPct > 0);
    const anyPartial = result.coverage.some((c) => c.partialPct > 0);
    const noFrameworkFullySupported = result.coverage.every((c) => c.supportedPct < 100);
    expect(anySupported).toBe(true);
    expect(anyPartial).toBe(true);
    expect(noFrameworkFullySupported).toBe(true);

    // The corpus should generate a substantial, realistic finding set, not
    // just the two flagship findings.
    expect(result.findings.length).toBeGreaterThanOrEqual(15);

    // The threshold-exception vs. universal-approval contradiction must be
    // caught between the policy doc and the architecture doc.
    expect(result.contradictions.length).toBeGreaterThanOrEqual(1);
    expect(result.contradictions.some((c) => c.topic === 'human-oversight')).toBe(true);

    // The policy prohibition vs. the config's granted access must produce a
    // real IMPLEMENTATION_GAP finding, not a false negative.
    const gapFindings = result.findings.filter((f) => f.type === 'IMPLEMENTATION_GAP');
    expect(gapFindings.length).toBeGreaterThanOrEqual(1);

    // Exactly one agent should be detected, with a materially complete
    // governance profile derived purely from evidence.
    expect(result.agentProfiles).toHaveLength(1);
    const profile = result.agentProfiles[0];
    expect(profile.name).toBe('ClaimsAgent');
    expect(profile.piiAccess).toBe('YES');
    expect(profile.financialAction).toBe('YES');
    expect(profile.humanApproval).toBe('YES');
    expect(profile.killSwitch).toBe('YES');
    expect(profile.leastPrivilege).toBe('YES');
    expect(profile.incidentProcedure).toBe('YES');
    expect(profile.externalActionsCount).toBeGreaterThanOrEqual(1);
  });
});
