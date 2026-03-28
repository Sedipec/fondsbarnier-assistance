'use client';

interface Document {
  id: string;
  type: string;
  label: string;
  received: boolean;
  receivedAt?: string | Date | null;
}

interface DocumentChecklistProps {
  documents: Document[];
  readonly?: boolean;
  onToggle?: (docId: string, received: boolean) => void;
}

export default function DocumentChecklist({
  documents,
  readonly = false,
  onToggle,
}: DocumentChecklistProps) {
  const receivedCount = documents.filter((d) => d.received).length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">Pieces justificatives</h3>
        <span className="badge badge-outline">
          {receivedCount}/{documents.length} recus
        </span>
      </div>
      <ul className="space-y-2">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              className="checkbox checkbox-sm checkbox-primary"
              checked={doc.received}
              disabled={readonly}
              onChange={() => onToggle?.(doc.id, !doc.received)}
            />
            <span
              className={`text-sm ${doc.received ? 'text-base-content/60 line-through' : ''}`}
            >
              {doc.label}
            </span>
            {doc.received && doc.receivedAt && (
              <span className="text-base-content/40 text-xs">
                {new Date(doc.receivedAt).toLocaleDateString('fr-FR')}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
