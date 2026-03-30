'use client';

import { useState } from 'react';
import { CheckCircle, Send } from 'lucide-react';

interface FormState {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  commune: string;
  codePostal: string;
  message: string;
}

const INITIAL_FORM: FormState = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  adresse: '',
  commune: '',
  codePostal: '',
  message: '',
};

export default function DemandeForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validation cote client
    if (!form.nom.trim() || !form.prenom.trim() || !form.email.trim()) {
      setError('Veuillez remplir les champs obligatoires (nom, prenom, email).');
      return;
    }

    if (!form.email.includes('@') || !form.email.includes('.')) {
      setError('Veuillez entrer une adresse email valide.');
      return;
    }

    if (form.codePostal && !/^\d{5}$/.test(form.codePostal)) {
      setError('Le code postal doit contenir 5 chiffres.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/demandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue. Veuillez reessayer.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Une erreur est survenue. Veuillez reessayer.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold">Demande envoyee</h2>
        <p className="text-base-content/70 max-w-md text-lg">
          Votre demande a bien ete envoyee. Nous vous recontacterons sous 48h.
        </p>
        <p className="text-base-content/50 text-sm">
          Un email de confirmation a ete envoye a{' '}
          <strong className="text-base-content/70">{form.email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="form-control">
          <label className="label" htmlFor="demande-nom">
            <span className="label-text">Nom *</span>
          </label>
          <input
            id="demande-nom"
            name="nom"
            type="text"
            className="input input-bordered w-full"
            value={form.nom}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-control">
          <label className="label" htmlFor="demande-prenom">
            <span className="label-text">Prenom *</span>
          </label>
          <input
            id="demande-prenom"
            name="prenom"
            type="text"
            className="input input-bordered w-full"
            value={form.prenom}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-control">
        <label className="label" htmlFor="demande-email">
          <span className="label-text">Email *</span>
        </label>
        <input
          id="demande-email"
          name="email"
          type="email"
          className="input input-bordered w-full"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-control">
        <label className="label" htmlFor="demande-telephone">
          <span className="label-text">Telephone</span>
        </label>
        <input
          id="demande-telephone"
          name="telephone"
          type="tel"
          className="input input-bordered w-full"
          value={form.telephone}
          onChange={handleChange}
        />
      </div>

      <div className="form-control">
        <label className="label" htmlFor="demande-adresse">
          <span className="label-text">Adresse du bien sinistre</span>
        </label>
        <input
          id="demande-adresse"
          name="adresse"
          type="text"
          className="input input-bordered w-full"
          value={form.adresse}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="form-control">
          <label className="label" htmlFor="demande-commune">
            <span className="label-text">Commune</span>
          </label>
          <input
            id="demande-commune"
            name="commune"
            type="text"
            className="input input-bordered w-full"
            value={form.commune}
            onChange={handleChange}
          />
        </div>
        <div className="form-control">
          <label className="label" htmlFor="demande-codePostal">
            <span className="label-text">Code postal</span>
          </label>
          <input
            id="demande-codePostal"
            name="codePostal"
            type="text"
            inputMode="numeric"
            pattern="\d{5}"
            maxLength={5}
            className="input input-bordered w-full"
            value={form.codePostal}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-control">
        <label className="label" htmlFor="demande-message">
          <span className="label-text">Decrivez votre situation</span>
        </label>
        <textarea
          id="demande-message"
          name="message"
          className="textarea textarea-bordered w-full"
          rows={4}
          placeholder="Type de sinistre, date, degats constates..."
          value={form.message}
          onChange={handleChange}
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="btn btn-primary btn-block gap-2 text-base"
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <>
              Envoyer ma demande
              <Send className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      <p className="text-base-content/40 text-center text-xs">
        Vos donnees sont protegees et confidentielles. En soumettant ce
        formulaire, vous acceptez d&apos;etre recontacte par notre equipe.
      </p>
    </form>
  );
}
