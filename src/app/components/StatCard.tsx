export function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-line rounded-md bg-ink-800 px-4 py-3">
      <div className="text-2xs uppercase text-fg-mute mono tracking-wide">{label}</div>
      <div className="text-2xl font-semibold text-fg mt-1">{value}</div>
      {sub && <div className="text-2xs text-fg-mute mt-1">{sub}</div>}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="border border-dashed border-line rounded-md py-16 flex flex-col items-center justify-center text-center gap-3">
      <div className="text-fg font-medium">{title}</div>
      <div className="text-sm text-fg-dim max-w-md">{body}</div>
      {action}
    </div>
  );
}
