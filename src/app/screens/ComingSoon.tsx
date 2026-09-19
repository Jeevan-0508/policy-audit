import { EmptyState } from '../components/StatCard';

export function ComingSoon({ title, note }: { title: string; note: string }) {
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-6">{title}</h1>
      <EmptyState title="Not built yet" body={note} />
    </div>
  );
}
