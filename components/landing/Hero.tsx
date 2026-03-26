export default function Hero() {
  return (
    <section className="hero bg-base-200 min-h-[70vh]">
      <div className="hero-content text-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold md:text-5xl">
            Sinistre inondation ?
            <br />
            <span className="text-primary">
              Nous vous accompagnons pas a pas.
            </span>
          </h1>
          <p className="text-base-content/70 py-6 text-lg">
            Constituez votre dossier Fonds Barnier (Cat Nat) simplement et
            suivez son avancement en temps reel. Un accompagnement clair pour
            vous aider a obtenir l&apos;indemnisation a laquelle vous avez
            droit.
          </p>
          <a href="/demande" className="btn btn-primary btn-lg">
            Commencer ma demande
          </a>
        </div>
      </div>
    </section>
  );
}
