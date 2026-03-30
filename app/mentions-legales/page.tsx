import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions legales',
  description:
    'Mentions legales, conditions generales de vente et politique de confidentialite de FondsBarnierAssistance.',
};

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Mentions legales</h1>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">1. Editeur du site</h2>
        <p className="text-base-content/80 leading-relaxed">
          Le site app.fondsbarnier.com est edite par la societe SEDIPEC.<br />
          Siege social : [Adresse a completer]<br />
          SIRET : [A completer]<br />
          Email : contact@fondsbarnier.com<br />
          Directeur de la publication : [A completer]
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">2. Hebergement</h2>
        <p className="text-base-content/80 leading-relaxed">
          Le site est heberge par Scaleway SAS<br />
          8 rue de la Ville l&apos;Eveque, 75008 Paris, France<br />
          Site web : scaleway.com
        </p>
      </section>

      <section className="mb-10">
        <h2 id="cgv" className="mb-4 text-xl font-semibold">
          3. Conditions generales de vente
        </h2>

        <h3 className="mb-2 mt-4 font-semibold">3.1 Objet</h3>
        <p className="text-base-content/80 mb-4 leading-relaxed">
          FondsBarnierAssistance propose un service d&apos;assistance a la
          constitution de dossiers de demande de subvention au titre du Fonds
          de Prevention des Risques Naturels Majeurs (Fonds Barnier), dans le
          cadre de sinistres lies aux inondations et catastrophes naturelles
          (Cat Nat).
        </p>

        <h3 className="mb-2 font-semibold">3.2 Prestations</h3>
        <p className="text-base-content/80 mb-4 leading-relaxed">
          La prestation comprend : la verification de l&apos;eligibilite du
          bien aupres de la DDTM, l&apos;assistance a la collecte des pieces
          justificatives, la constitution et le depot du dossier aupres de la
          DDTM. Le service ne garantit pas l&apos;obtention de la subvention,
          celle-ci relevant de la decision des autorites competentes.
        </p>

        <h3 className="mb-2 font-semibold">3.3 Tarification</h3>
        <p className="text-base-content/80 mb-4 leading-relaxed">
          Les honoraires s&apos;elevent a <strong>250 EUR TTC</strong> par
          dossier, payables en ligne par carte bancaire via la plateforme
          securisee Stripe, au moment de la signature du devis (etape 6 du
          processus). Le paiement est du uniquement apres validation de
          l&apos;eligibilite du bien.
        </p>

        <h3 className="mb-2 font-semibold">3.4 Droit de retractation</h3>
        <p className="text-base-content/80 mb-4 leading-relaxed">
          Conformement a l&apos;article L221-18 du Code de la consommation,
          le client dispose d&apos;un delai de 14 jours a compter de la
          signature du devis pour exercer son droit de retractation, sans
          avoir a justifier de motif. Pour exercer ce droit, le client doit
          adresser un email a contact@fondsbarnier.com. En cas de
          retractation, le remboursement sera effectue dans un delai de 14
          jours.
        </p>

        <h3 className="mb-2 font-semibold">3.5 Responsabilite</h3>
        <p className="text-base-content/80 mb-4 leading-relaxed">
          FondsBarnierAssistance s&apos;engage a mettre en oeuvre tous les
          moyens necessaires pour la bonne constitution du dossier. Il
          s&apos;agit d&apos;une obligation de moyens et non de resultat.
          L&apos;obtention de la subvention depend exclusivement des
          autorites administratives competentes.
        </p>
      </section>

      <section className="mb-10">
        <h2 id="politique-confidentialite" className="mb-4 text-xl font-semibold">
          4. Politique de confidentialite
        </h2>

        <h3 className="mb-2 mt-4 font-semibold">
          4.1 Donnees collectees
        </h3>
        <p className="text-base-content/80 mb-4 leading-relaxed">
          Nous collectons les donnees suivantes : nom, prenom, email,
          telephone, adresse postale, references cadastrales, documents
          justificatifs (attestation assurance, RIB, devis de travaux,
          diagnostic inondation). Ces donnees sont strictement necessaires a
          la constitution du dossier Fonds Barnier.
        </p>

        <h3 className="mb-2 font-semibold">4.2 Finalites</h3>
        <p className="text-base-content/80 mb-4 leading-relaxed">
          Les donnees sont utilisees exclusivement pour : la constitution et
          le suivi du dossier Fonds Barnier, la communication avec le client
          concernant l&apos;avancement de son dossier, la facturation des
          prestations.
        </p>

        <h3 className="mb-2 font-semibold">4.3 Duree de conservation</h3>
        <p className="text-base-content/80 mb-4 leading-relaxed">
          Les donnees personnelles sont conservees pendant toute la duree du
          traitement du dossier et 3 ans apres sa cloture, conformement aux
          obligations legales.
        </p>

        <h3 className="mb-2 font-semibold">4.4 Droits des utilisateurs</h3>
        <p className="text-base-content/80 mb-4 leading-relaxed">
          Conformement au RGPD, vous disposez d&apos;un droit d&apos;acces,
          de rectification, de suppression et de portabilite de vos donnees.
          Pour exercer ces droits, contactez-nous a :
          contact@fondsbarnier.com.
        </p>

        <h3 className="mb-2 font-semibold">4.5 Sous-traitants</h3>
        <p className="text-base-content/80 mb-4 leading-relaxed">
          Les donnees peuvent etre transmises aux sous-traitants suivants
          dans le cadre strict de nos prestations : Scaleway (hebergement),
          Stripe (paiement), Resend (emails transactionnels). Aucune donnee
          n&apos;est vendue ou partagee a des fins commerciales tierces.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">5. Cookies</h2>
        <p className="text-base-content/80 leading-relaxed">
          Le site utilise uniquement des cookies techniques necessaires au
          fonctionnement de l&apos;application (session d&apos;authentification).
          Aucun cookie publicitaire ou de suivi n&apos;est utilise.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">
          6. Propriete intellectuelle
        </h2>
        <p className="text-base-content/80 leading-relaxed">
          L&apos;ensemble du contenu du site (textes, images, logos, code
          source) est la propriete exclusive de SEDIPEC. Toute reproduction
          est interdite sans autorisation prealable.
        </p>
      </section>

      <p className="text-base-content/50 mt-12 text-sm">
        Derniere mise a jour : mars 2026
      </p>
    </div>
  );
}
