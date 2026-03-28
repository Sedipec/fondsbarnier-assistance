'use client';

import { useState } from 'react';
import {
  MessageSquare,
  ArrowRightLeft,
  FileCheck,
  PlusCircle,
  Send,
} from 'lucide-react';

interface HistoryEntry {
  id: string;
  type: string;
  content: string;
  authorId?: string | null;
  createdAt: string | Date;
}

interface NoteHistoryProps {
  history: HistoryEntry[];
  onAddNote?: (content: string) => void;
}

const TYPE_ICONS: Record<string, typeof MessageSquare> = {
  note: MessageSquare,
  etape_change: ArrowRightLeft,
  document: FileCheck,
  creation: PlusCircle,
};

const TYPE_LABELS: Record<string, string> = {
  note: 'Note',
  etape_change: 'Changement d\'etape',
  document: 'Document',
  creation: 'Creation',
};

export default function NoteHistory({
  history,
  onAddNote,
}: NoteHistoryProps) {
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim() || !onAddNote) return;

    setLoading(true);
    onAddNote(newNote.trim());
    setNewNote('');
    setLoading(false);
  }

  return (
    <div>
      <h3 className="mb-3 text-base font-semibold">Notes et historique</h3>

      {onAddNote && (
        <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
          <input
            type="text"
            className="input input-bordered input-sm flex-1"
            placeholder="Ajouter une note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={loading || !newNote.trim()}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      )}

      <div className="space-y-3">
        {history.length === 0 && (
          <p className="text-base-content/50 text-sm">Aucun historique.</p>
        )}
        {history.map((entry) => {
          const Icon = TYPE_ICONS[entry.type] ?? MessageSquare;
          return (
            <div
              key={entry.id}
              className="flex items-start gap-3 border-l-2 border-base-300 pl-3"
            >
              <Icon className="text-base-content/50 mt-0.5 h-4 w-4 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm">{entry.content}</p>
                <p className="text-base-content/40 text-xs">
                  {TYPE_LABELS[entry.type] ?? entry.type} —{' '}
                  {new Date(entry.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
