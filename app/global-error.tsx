'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr" data-theme="light">
      <body
        style={{
          margin: 0,
          fontFamily: 'Inter, system-ui, sans-serif',
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div style={{ maxWidth: '32rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
            Une erreur est survenue
          </h1>
          <p
            style={{
              color: '#6b7280',
              fontSize: '1.125rem',
              padding: '1.5rem 0',
            }}
          >
            Nous nous excusons pour le desagrement. Veuillez reessayer.
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 500,
                color: '#fff',
                backgroundColor: '#570df8',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
            >
              Reessayer
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 500,
                color: '#570df8',
                border: '1px solid #570df8',
                borderRadius: '0.5rem',
                textDecoration: 'none',
              }}
            >
              Retour a l&apos;accueil
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
