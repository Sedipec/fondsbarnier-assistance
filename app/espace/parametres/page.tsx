'use client';

import { useState, useCallback } from 'react';
import { User, Lock, Bell, Download } from 'lucide-react';
import ProfileForm from '@/components/settings/ProfileForm';
import PasswordForm from '@/components/settings/PasswordForm';
import NotificationForm from '@/components/settings/NotificationForm';
import DeleteAccountSection from '@/components/settings/DeleteAccountSection';

const tabs = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'password', label: 'Mot de passe', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function EspaceParametresPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [exporting, setExporting] = useState(false);

  const handleExportData = useCallback(async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/v1/profile/export');
      if (!response.ok) {
        throw new Error('Erreur lors de l\'export.');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'export-donnees-personnelles.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert('Une erreur est survenue lors de l\'export de vos donnees.');
    } finally {
      setExporting(false);
    }
  }, []);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-8 text-3xl font-bold">Paramètres</h1>

      {/* Onglets */}
      <div role="tablist" className="tabs tabs-bordered mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              role="tab"
              className={`tab gap-2 ${activeTab === tab.id ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenu */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {activeTab === 'profile' && (
            <>
              <h2 className="card-title mb-4">Informations du profil</h2>
              <ProfileForm />
            </>
          )}
          {activeTab === 'password' && (
            <>
              <h2 className="card-title mb-4">Changer le mot de passe</h2>
              <PasswordForm />
            </>
          )}
          {activeTab === 'notifications' && (
            <>
              <h2 className="card-title mb-4">Préférences de notifications</h2>
              <NotificationForm />
            </>
          )}
        </div>
      </div>

      {/* Donnees personnelles (RGPD) */}
      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-body">
          <h2 className="card-title mb-4">Donnees personnelles</h2>
          <p className="text-sm text-base-content/70 mb-4">
            Conformement au RGPD, vous pouvez exporter l&apos;ensemble de vos
            donnees personnelles au format JSON.
          </p>
          <div>
            <button
              className="btn btn-outline gap-2"
              onClick={handleExportData}
              disabled={exporting}
            >
              <Download className="h-4 w-4" />
              {exporting ? 'Export en cours...' : 'Exporter mes donnees'}
            </button>
          </div>
        </div>
      </div>

      {/* Zone dangereuse */}
      <DeleteAccountSection />
    </div>
  );
}
