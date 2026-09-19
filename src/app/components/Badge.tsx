import type { FindingType, RequirementStatus, Severity } from '@core/types';

const SEVERITY_STYLES: Record<Severity, string> = {
  CRITICAL: 'bg-critical/15 text-critical border-critical/40',
  HIGH: 'bg-missing/15 text-missing border-missing/40',
  MEDIUM: 'bg-partial/15 text-partial border-partial/40',
  LOW: 'bg-info/15 text-info border-info/40',
  INFORMATIONAL: 'bg-fg-mute/15 text-fg-dim border-line-bright',
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`mono text-2xs uppercase px-2 py-0.5 rounded border ${SEVERITY_STYLES[severity]}`}>
      {severity}
    </span>
  );
}

const STATUS_STYLES: Record<RequirementStatus, string> = {
  SUPPORTED: 'bg-support/15 text-support border-support/40',
  PARTIAL: 'bg-partial/15 text-partial border-partial/40',
  MISSING: 'bg-missing/15 text-missing border-missing/40',
};

export function StatusBadge({ status }: { status: RequirementStatus }) {
  return (
    <span className={`mono text-2xs uppercase px-2 py-0.5 rounded border ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

const TYPE_STYLES: Partial<Record<FindingType, string>> = {
  CONFLICT: 'bg-conflict/15 text-conflict border-conflict/40',
  IMPLEMENTATION_GAP: 'bg-missing/15 text-missing border-missing/40',
};

export function FindingTypeBadge({ type }: { type: FindingType }) {
  const style = TYPE_STYLES[type] ?? 'bg-fg-mute/15 text-fg-dim border-line-bright';
  return (
    <span className={`mono text-2xs uppercase px-2 py-0.5 rounded border ${style}`}>
      {type.replace(/_/g, ' ')}
    </span>
  );
}
