'use client';

import { useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

const CONFIRMATION_TEXT = 'SUPPRIMER MON COMPTE';

export default function DeleteAccountSection() {
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef<HTMLDialogElement>(null);

  function openModal() {
    setConfirmation('');
    setError('');
    modalRef.current?.showModal();
  }

  function closeModal() {
    modalRef.current?.close();
    setConfirmation('');
    setError('');
  }

  async function handleDelete() {
    setDeleting(true);
    setError('');

    try {
      const res = await fetch('/api/v1/profile', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation }),
      });
      const data = await res.json();

      if (res.ok) {
        window.location.href = '/';
      } else {
        setError(data.error || 'Erreur lors de la suppression du compte.');
      }
    } catch {
      setError('Erreur lors de la suppression du compte.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="card border-2 border-error bg-base-100 mt-8">
        <div className="card-body">
          <h2 className="card-title text-error">
            <AlertTriangle className="h-5 w-5" />
            Zone dangereuse
          </h2>
          <p className="text-sm">
            La suppression de votre compte est irr&eacute;versible. Toutes vos
            donn&eacute;es personnelles seront anonymis&eacute;es et votre
            acc&egrave;s sera d&eacute;finitivement supprim&eacute;.
          </p>
          <div className="card-actions mt-2">
            <button className="btn btn-error btn-outline" onClick={openModal}>
              Supprimer mon compte
            </button>
          </div>
        </div>
      </div>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold text-error">
            Confirmer la suppression du compte
          </h3>
          <div className="py-4 space-y-3">
            <p className="text-sm">
              Cette action est <strong>irr&eacute;versible</strong>. Vos
              donn&eacute;es personnelles seront anonymis&eacute;es et votre
              compte sera d&eacute;finitivement supprim&eacute;.
            </p>
            <p className="text-sm">
              Pour confirmer, saisissez{' '}
              <code className="bg-base-200 px-2 py-0.5 rounded text-error font-bold">
                {CONFIRMATION_TEXT}
              </code>{' '}
              ci-dessous :
            </p>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder={CONFIRMATION_TEXT}
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
            />
            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}
          </div>
          <div className="modal-action">
            <button className="btn" onClick={closeModal} disabled={deleting}>
              Annuler
            </button>
            <button
              className="btn btn-error"
              disabled={confirmation !== CONFIRMATION_TEXT || deleting}
              onClick={handleDelete}
            >
              {deleting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                'Supprimer definitivement'
              )}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
