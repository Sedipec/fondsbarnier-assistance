'use client';

export default function AppConfig() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <h3 className="font-semibold">Version</h3>
            <p className="text-base-content/60 text-sm">0.1.0</p>
          </div>
        </div>

        <div className="card bg-base-200">
          <div className="card-body p-4">
            <h3 className="font-semibold">Environnement</h3>
            <p className="text-base-content/60 text-sm">
              {process.env.NODE_ENV === 'production'
                ? 'Production'
                : 'Développement'}
            </p>
          </div>
        </div>
      </div>

      <div className="divider"></div>

      <div>
        <h3 className="mb-2 font-semibold">Paramètres généraux</h3>
        <p className="text-base-content/60 text-sm">
          Les paramètres avancés de l&apos;application seront disponibles dans
          une prochaine version.
        </p>
      </div>
    </div>
  );
}
