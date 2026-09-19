import { FRAMEWORK_META, REQUIREMENTS_BY_FRAMEWORK } from '@core/frameworks';
import { useAuditStore } from '../lib/store';

export function Frameworks() {
  const { result } = useAuditStore();
  const coverageByFw = new Map(result?.coverage.map((c) => [c.framework, c]) ?? []);

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-1">Frameworks</h1>
      <p className="text-sm text-fg-dim mb-6">
        POLICY//AUDIT does not provide legal advice and does not establish legal compliance. Article/clause
        references are pointers for a human reviewer holding the source text, not reproductions of it.
      </p>
      <div className="grid grid-cols-2 gap-4">
        {Object.values(FRAMEWORK_META).map((fw) => {
          const coverage = coverageByFw.get(fw.id);
          const count = REQUIREMENTS_BY_FRAMEWORK[fw.id].length;
          return (
            <div key={fw.id} className="border border-line rounded-md bg-ink-800 p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium">{fw.shortName}</div>
                <div className="mono text-2xs text-fg-mute">{fw.version}</div>
              </div>
              <div className="text-sm text-fg-dim mb-3">{fw.name}</div>
              <p className="text-sm text-fg-dim mb-3">{fw.description}</p>
              <div className="mono text-2xs text-fg-mute">
                {count} requirements{coverage ? ` \u00b7 ${coverage.supportedPct}% supported` : ''}
              </div>
              {fw.referenceUrl && (
                <a href={fw.referenceUrl} target="_blank" rel="noreferrer" className="text-2xs text-accent mono block mt-2">
                  REFERENCE &rarr;
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
