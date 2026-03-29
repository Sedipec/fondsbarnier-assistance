'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FolderOpen,
  Users,
  FileCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  FileText,
  MessageSquare,
  ArrowUpDown,
  PlusCircle,
} from 'lucide-react';

interface DashboardData {
  kpis: {
    totalDossiers: number;
    dossiersThisMonth: number;
    documentCompletionRate: number;
    totalUsers: number;
    adminCount: number;
    clientCount: number;
  };
  byStatut: Record<string, number>;
  byEtape: { etape: number; count: number }[];
  recentDossiers: {
    id: string;
    reference: string;
    nom: string;
    prenom: string;
    commune: string | null;
    etape: number;
    statut: string;
    createdAt: string;
  }[];
  recentActivity: {
    id: string;
    type: string;
    content: string;
    createdAt: string;
    dossierReference: string | null;
  }[];
}

const ETAPE_LABELS: Record<number, string> = {
  1: 'Formulaire recu',
  2: 'Infos cadastrales',
  3: 'Infos client',
  4: 'Eligibilite DDTM',
  5: 'Devis presente',
  6: 'Devis signe',
  7: 'Pieces justif.',
  8: 'Depot DDTM',
  9: 'Instruction',
  10: 'Subvention',
};

const PHASE_RANGES = [
  { label: 'Qualification', etapes: [1, 2, 3, 4], color: 'bg-info' },
  { label: 'Engagement', etapes: [5, 6, 7], color: 'bg-success' },
  { label: 'Instruction', etapes: [8, 9, 10], color: 'bg-warning' },
];

const STATUT_CONFIG: Record<string, { label: string; class: string }> = {
  actif: { label: 'Actifs', class: 'badge-success' },
  suspendu: { label: 'Suspendus', class: 'badge-warning' },
  clos: { label: 'Clos', class: 'badge-neutral' },
  non_eligible: { label: 'Non eligibles', class: 'badge-error' },
};

const ACTIVITY_ICONS: Record<string, typeof FileText> = {
  note: MessageSquare,
  etape_change: ArrowUpDown,
  document: FileCheck,
  creation: PlusCircle,
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/v1/admin/dashboard')
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
        } else {
          setData(json.data);
        }
      })
      .catch(() => setError('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold md:mb-8 md:text-3xl">
          Tableau de bord
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card bg-base-100 shadow">
              <div className="card-body">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton mt-2 h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold md:mb-8 md:text-3xl">
          Tableau de bord
        </h1>
        <div className="alert alert-error">{error || 'Erreur inconnue'}</div>
      </div>
    );
  }

  const { kpis, byStatut, byEtape, recentDossiers, recentActivity } = data;

  // Calcul du max pour les barres d'etape
  const maxEtapeCount = Math.max(...byEtape.map((e) => e.count), 1);
  const etapeMap = Object.fromEntries(byEtape.map((e) => [e.etape, e.count]));

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between md:mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Tableau de bord</h1>
        <Link href="/admin/dossiers" className="btn btn-primary btn-sm gap-2">
          <FolderOpen className="h-4 w-4" />
          Voir les dossiers
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-base-content/60 text-xs sm:text-sm">
                  Total dossiers
                </p>
                <p className="text-2xl font-bold">{kpis.totalDossiers}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2.5">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-base-content/60 text-xs sm:text-sm">
                  Ce mois-ci
                </p>
                <p className="text-2xl font-bold">{kpis.dossiersThisMonth}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-info/10 p-2.5">
                <FileCheck className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-base-content/60 text-xs sm:text-sm">
                  Documents recus
                </p>
                <p className="text-2xl font-bold">
                  {kpis.documentCompletionRate}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2.5">
                <Users className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-base-content/60 text-xs sm:text-sm">
                  Utilisateurs
                </p>
                <p className="text-2xl font-bold">{kpis.totalUsers}</p>
                <p className="text-base-content/50 text-xs">
                  {kpis.adminCount} admin{kpis.adminCount > 1 ? 's' : ''} /{' '}
                  {kpis.clientCount} client{kpis.clientCount > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Repartition par statut */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card bg-base-100 shadow">
          <div className="card-body p-4 sm:p-6">
            <h2 className="card-title text-base">Repartition par statut</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {Object.entries(STATUT_CONFIG).map(([key, config]) => {
                const count = byStatut[key] ?? 0;
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className={`badge ${config.class} badge-lg gap-1`}>
                      <span className="font-bold">{count}</span>
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pipeline par phase */}
        <div className="card bg-base-100 shadow">
          <div className="card-body p-4 sm:p-6">
            <h2 className="card-title text-base">Pipeline (dossiers actifs)</h2>
            <div className="mt-3 space-y-3">
              {PHASE_RANGES.map((phase) => {
                const phaseCount = phase.etapes.reduce(
                  (sum, e) => sum + (etapeMap[e] ?? 0),
                  0,
                );
                return (
                  <div key={phase.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">{phase.label}</span>
                      <span className="text-base-content/60">
                        {phaseCount} dossier{phaseCount > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="bg-base-200 h-3 w-full overflow-hidden rounded-full">
                      <div
                        className={`${phase.color} h-full rounded-full transition-all`}
                        style={{
                          width: `${kpis.totalDossiers > 0 ? (phaseCount / kpis.totalDossiers) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Detail par etape */}
      <div className="card bg-base-100 mt-4 shadow">
        <div className="card-body p-4 sm:p-6">
          <h2 className="card-title text-base">Detail par etape</h2>
          <div className="mt-3 space-y-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((etape) => {
              const cnt = etapeMap[etape] ?? 0;
              return (
                <div key={etape} className="flex items-center gap-3 text-sm">
                  <span className="text-base-content/50 w-5 text-right font-mono">
                    {etape}
                  </span>
                  <span className="w-32 truncate sm:w-40">
                    {ETAPE_LABELS[etape]}
                  </span>
                  <div className="bg-base-200 flex-1 overflow-hidden rounded-full">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        etape <= 4
                          ? 'bg-info'
                          : etape <= 7
                            ? 'bg-success'
                            : 'bg-warning'
                      }`}
                      style={{
                        width: `${maxEtapeCount > 0 ? (cnt / maxEtapeCount) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-base-content/60 w-8 text-right font-mono">
                    {cnt}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Derniers dossiers + Activite recente */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Derniers dossiers */}
        <div className="card bg-base-100 shadow">
          <div className="card-body p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="card-title text-base">Derniers dossiers</h2>
              <Link
                href="/admin/dossiers"
                className="btn btn-ghost btn-xs gap-1"
              >
                Tout voir <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="mt-3 space-y-2">
              {recentDossiers.length === 0 ? (
                <p className="text-base-content/50 py-4 text-center text-sm">
                  Aucun dossier
                </p>
              ) : (
                recentDossiers.map((d) => (
                  <Link
                    key={d.id}
                    href={`/admin/dossiers/${d.id}`}
                    className="hover:bg-base-200 flex items-center justify-between rounded-lg p-2 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-primary">
                          {d.reference}
                        </span>
                        <StatutDot statut={d.statut} />
                      </div>
                      <p className="text-base-content/70 truncate text-sm">
                        {d.prenom} {d.nom}
                        {d.commune ? ` — ${d.commune}` : ''}
                      </p>
                    </div>
                    <div className="ml-2 text-right">
                      <span className="badge badge-sm badge-outline">
                        {d.etape}/10
                      </span>
                      <p className="text-base-content/50 mt-0.5 text-xs">
                        {formatDate(d.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Activite recente */}
        <div className="card bg-base-100 shadow">
          <div className="card-body p-4 sm:p-6">
            <h2 className="card-title text-base">Activite recente</h2>
            <div className="mt-3 space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-base-content/50 py-4 text-center text-sm">
                  Aucune activite
                </p>
              ) : (
                recentActivity.map((a) => {
                  const Icon = ACTIVITY_ICONS[a.type] ?? FileText;
                  return (
                    <div key={a.id} className="flex gap-3 text-sm">
                      <div className="bg-base-200 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                        <Icon className="text-base-content/50 h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate">{a.content}</p>
                        <div className="text-base-content/50 flex items-center gap-2 text-xs">
                          {a.dossierReference && (
                            <span className="font-mono text-primary">
                              {a.dossierReference}
                            </span>
                          )}
                          <Clock className="h-3 w-3" />
                          <span>{formatRelative(a.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatutDot({ statut }: { statut: string }) {
  const colors: Record<string, string> = {
    actif: 'bg-success',
    suspendu: 'bg-warning',
    clos: 'bg-neutral',
    non_eligible: 'bg-error',
  };
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${colors[statut] ?? 'bg-ghost'}`}
      title={statut}
    />
  );
}
