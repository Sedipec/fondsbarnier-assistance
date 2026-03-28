'use client';

import { useState } from 'react';
import { User, Lock, Bell } from 'lucide-react';
import ProfileForm from '@/components/settings/ProfileForm';
import PasswordForm from '@/components/settings/PasswordForm';
import NotificationForm from '@/components/settings/NotificationForm';

const tabs = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'password', label: 'Mot de passe', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function EspaceParametresPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile');

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
    </div>
  );
}
