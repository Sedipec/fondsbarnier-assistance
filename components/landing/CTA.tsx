import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="bg-neutral px-4 py-16 sm:px-6 md:py-20">
      <div className="mx-auto max-w-3xl text-center text-neutral-content">
        <h2 className="text-3xl font-bold md:text-4xl">
          Pret a lancer votre demande ?
        </h2>
        <p className="mt-4 text-lg text-neutral-content/70">
          Verifiez gratuitement votre eligibilite au Fonds Barnier. Reponse sous
          48 heures, sans engagement.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
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
            Nous appeler
          </a>
        </div>
      </div>
    </section>
  );
}
