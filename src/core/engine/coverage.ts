import type { FrameworkCoverage, FrameworkId } from '../types';
import type { RequirementMatch } from './match';

export function computeFrameworkCoverage(matches: RequirementMatch[]): FrameworkCoverage[] {
  const byFramework = new Map<FrameworkId, RequirementMatch[]>();
  for (const m of matches) {
    const fw = m.requirement.framework;
    if (!byFramework.has(fw)) byFramework.set(fw, []);
    byFramework.get(fw)!.push(m);
  }

  const results: FrameworkCoverage[] = [];
  for (const [framework, list] of byFramework) {
    const total = list.length;
    const supported = list.filter((m) => m.status === 'SUPPORTED').length;
    const partial = list.filter((m) => m.status === 'PARTIAL').length;
    const missing = list.filter((m) => m.status === 'MISSING').length;
    results.push({
      framework,
      supportedPct: total ? Math.round((supported / total) * 100) : 0,
      partialPct: total ? Math.round((partial / total) * 100) : 0,
      missingPct: total ? Math.round((missing / total) * 100) : 0,
      requirementCount: total,
    });
  }
  return results;
}
