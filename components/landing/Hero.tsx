import Link from 'next/link';
import {
  Shield,
  CheckCircle,
  ArrowRight,
  Star,
} from 'lucide-react';

const highlights = [
  'Verification d\'eligibilite gratuite',
  'Constitution complete du dossier',
  'Suivi en temps reel de votre demande',
  'Accompagnement jusqu\'a l\'obtention',
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-neutral via-neutral/95 to-primary/20">
      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Texte */}
          <div className="text-neutral-content">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm">
              <Shield className="h-4 w-4 text-primary-content" />
              <span>Forfait unique 250 EUR TTC</span>
            </div>

            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Sinistre inondation ?{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Obtenez votre subvention.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-lg text-neutral-content/70 sm:text-xl">
              Nous simplifions vos demarches pour l&apos;obtention de
              subventions du Fonds Barnier (Cat Nat). Plus de 500 dossiers
              traites avec succes.
            </p>

            <ul className="mt-8 space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm sm:text-base">
                  <CheckCircle className="h-5 w-5 shrink-0 text-green-400" />
                  <span className="text-neutral-content/90">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/demande"
                className="btn btn-primary btn-lg gap-2 text-base shadow-lg shadow-primary/25"
              >
                Commencer ma demande
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="tel:+33188845252"
                className="btn btn-outline btn-lg border-white/20 text-base text-white hover:bg-white/10 hover:border-white/30"
              >
                01 88 84 52 52
              </a>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-4 border-t border-white/10 pt-6">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-neutral bg-gradient-to-br from-primary/60 to-secondary/60 text-xs font-bold text-white"
                  >
                    {['MR', 'SL', 'JD', 'PB'][i]}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  <span className="ml-1 font-semibold">4.9/5</span>
                </div>
                <p className="text-neutral-content/60">
                  +500 dossiers accompagnes
                </p>
              </div>
            </div>
          </div>

          {/* Formulaire rapide */}
          <div className="hidden lg:block">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
              <h2 className="mb-1 text-xl font-bold text-white">
                Verifiez votre eligibilite
              </h2>
              <p className="mb-6 text-sm text-neutral-content/60">
                Reponse sous 48h, sans engagement
              </p>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Prenom"
                    className="input input-bordered w-full bg-white/10 text-white placeholder:text-white/40"
                  />
                  <input
                    type="text"
                    placeholder="Nom"
                    className="input input-bordered w-full bg-white/10 text-white placeholder:text-white/40"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Adresse email"
                  className="input input-bordered w-full bg-white/10 text-white placeholder:text-white/40"
                />
                <input
                  type="tel"
                  placeholder="Telephone"
                  className="input input-bordered w-full bg-white/10 text-white placeholder:text-white/40"
                />
                <input
                  type="text"
                  placeholder="Code postal du sinistre"
                  className="input input-bordered w-full bg-white/10 text-white placeholder:text-white/40"
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-block text-base shadow-lg"
                >
                  Verifier mon eligibilite
                </button>
              </form>
              <p className="mt-3 text-center text-xs text-neutral-content/40">
                Vos donnees sont protegees et confidentielles
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
