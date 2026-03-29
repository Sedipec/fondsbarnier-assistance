'use client';

import { useRef, useState } from 'react';

interface Document {
  id: string;
  type: string;
  label: string;
  received: boolean;
  receivedAt?: string | Date | null;
  fileUrl?: string | null;
}

interface DocumentChecklistProps {
  documents: Document[];
  readonly?: boolean;
  allowUpload?: boolean;
  onToggle?: (docId: string, received: boolean) => void;
  onUploaded?: () => void;
}

export default function DocumentChecklist({
  documents,
  readonly = false,
  allowUpload = false,
  onToggle,
  onUploaded,
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
      <ul className="space-y-3">
        {documents.map((doc) => (
          <li key={doc.id} className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-primary"
                checked={doc.received}
                disabled={readonly}
                onChange={() => onToggle?.(doc.id, !doc.received)}
              />
              <span
                className={`text-sm ${doc.received ? 'text-base-content/60 line-through' : 'font-medium'}`}
              >
                {doc.label}
              </span>
              {doc.received && doc.receivedAt && (
                <span className="text-base-content/40 text-xs">
                  {new Date(doc.receivedAt).toLocaleDateString('fr-FR')}
                </span>
              )}
              {doc.fileUrl && (
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary text-xs"
                >
                  Voir
                </a>
              )}
            </div>
            {allowUpload && !doc.received && (
              <UploadButton documentId={doc.id} onUploaded={onUploaded} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function UploadButton({
  documentId,
  onUploaded,
}: {
  documentId: string;
  onUploaded?: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentId', documentId);

    try {
      const res = await fetch('/api/v1/documents/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de l\'envoi.');
      } else {
        onUploaded?.();
      }
    } catch {
      setError('Erreur lors de l\'envoi.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="ml-8">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={handleFile}
        disabled={uploading}
        className="file-input file-input-bordered file-input-xs w-full max-w-xs"
      />
      {uploading && (
        <span className="loading loading-spinner loading-xs ml-2"></span>
      )}
      {error && <p className="text-error mt-1 text-xs">{error}</p>}
    </div>
  );
}
