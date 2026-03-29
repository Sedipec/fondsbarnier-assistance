import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral text-neutral-content">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Marque */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-content">
                  FB
                </span>
              </div>
              <div>
                <span className="font-bold">FondsBarnier</span>
                <span className="font-light text-primary">Assistance</span>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-neutral-content/60">
              Simplifier vos demarches pour l&apos;obtention de subventions
              inondation du Fonds Barnier.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm text-neutral-content/60">
              <li>
                <Link href="/#services" className="hover:text-primary transition-colors">
                  Nos services
                </Link>
              </li>
              <li>
                <Link href="/#comment-ca-marche" className="hover:text-primary transition-colors">
                  Comment ca marche
                </Link>
              </li>
              <li>
                <Link href="/#temoignages" className="hover:text-primary transition-colors">
                  Temoignages
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  A propos
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Informations legales
            </h3>
            <ul className="space-y-2.5 text-sm text-neutral-content/60">
              <li>
                <Link href="/mentions-legales" className="hover:text-primary transition-colors">
                  Mentions legales
                </Link>
              </li>
              <li>
                <Link href="/politique-confidentialite" className="hover:text-primary transition-colors">
                  Politique de confidentialite
                </Link>
              </li>
              <li>
                <Link href="/cgv" className="hover:text-primary transition-colors">
                  CGV
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-neutral-content/60">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a
                  href="mailto:contact@fondsbarnier.com"
                  className="hover:text-primary transition-colors"
                >
                  contact@fondsbarnier.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a
                  href="tel:+33188845252"
                  className="hover:text-primary transition-colors"
                >
                  01 88 84 52 52
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>Lun - Ven : 9h - 17h15</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-content/10 pt-6 text-center text-xs text-neutral-content/40">
          &copy; {new Date().getFullYear()} FondsBarnierAssistance — Tous droits
          reserves.
        </div>
      </div>
    </footer>
  );
}
