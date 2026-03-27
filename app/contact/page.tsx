'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { submitContactForm } from './actions';

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    null,
  );
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;

    if (state.success) {
      setToast({
        type: 'success',
        message: 'Votre message a bien ete envoye. Merci !',
      });
      formRef.current?.reset();
    } else if (state.error) {
      setToast({ type: 'error', message: state.error });
    }

    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <h1 className="mb-8 text-center text-4xl font-bold">Contact</h1>

        {toast && (
          <div
            role="alert"
            className={`alert mb-6 ${toast.type === 'success' ? 'alert-success' : 'alert-error'}`}
          >
            <span>{toast.message}</span>
          </div>
        )}

        <form ref={formRef} action={formAction}>
          <fieldset disabled={isPending} className="space-y-4">
            <div className="form-control">
              <label htmlFor="name" className="label">
                <span className="label-text">Nom</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input input-bordered w-full"
                placeholder="Votre nom"
              />
            </div>

            <div className="form-control">
              <label htmlFor="email" className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input input-bordered w-full"
                placeholder="votre@email.com"
              />
            </div>

            <div className="form-control">
              <label htmlFor="message" className="label">
                <span className="label-text">Message</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="textarea textarea-bordered w-full"
                placeholder="Votre message..."
              />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              {isPending ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                'Envoyer'
              )}
            </button>
          </fieldset>
        </form>
      </div>
    </main>
  );
}
