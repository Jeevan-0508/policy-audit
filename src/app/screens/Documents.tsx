import { useAuditStore } from '../lib/store';
import { EmptyState } from '../components/StatCard';

export function Documents() {
  const { ingested } = useAuditStore();

  if (ingested.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold mb-6">Documents</h1>
        <EmptyState title="No documents yet" body="Upload documents to see provenance metadata for each one." />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-6">Documents</h1>
      <div className="border border-line rounded-md bg-ink-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-fg-mute text-2xs border-b border-line">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Filename</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Size</th>
              <th className="px-4 py-2">Hash</th>
              <th className="px-4 py-2">Chunks</th>
              <th className="px-4 py-2">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {ingested.map((i) => (
              <tr key={i.document.id} className="border-b border-line/50">
                <td className="px-4 py-2 mono text-2xs text-fg-mute">{i.document.id}</td>
                <td className="px-4 py-2">{i.document.filename}</td>
                <td className="px-4 py-2 mono text-2xs uppercase">{i.document.fileType}</td>
                <td className="px-4 py-2 mono text-2xs">{(i.document.sizeBytes / 1024).toFixed(1)} KB</td>
                <td className="px-4 py-2 mono text-2xs text-fg-mute">{i.document.hash}</td>
                <td className="px-4 py-2 mono text-2xs">{i.chunks.length}</td>
                <td className="px-4 py-2 mono text-2xs text-fg-mute">{new Date(i.document.uploadedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
