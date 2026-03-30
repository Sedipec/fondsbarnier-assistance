'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  dossierId: string | null;
  createdAt: string;
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'A l\'instant';
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `Il y a ${diffD}j`;
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/notifications?limit=1');
      if (res.ok) {
        const json = await res.json();
        setUnreadCount(json.unreadCount ?? 0);
      }
    } catch {
      // Silencieux en cas d'erreur reseau
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/notifications?limit=10');
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data ?? []);
        setUnreadCount(json.unreadCount ?? 0);
      }
    } catch {
      // Silencieux en cas d'erreur reseau
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling toutes les 30 secondes pour le compteur
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Charger les notifications a l'ouverture du dropdown
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  // Fermer le dropdown au clic en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/v1/notifications/${id}`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silencieux
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/v1/notifications/read-all', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Silencieux
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-circle relative"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-error-content">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-base-300 bg-base-100 shadow-xl sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-base-300 px-4 py-3">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={handleMarkAllAsRead}
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <span className="loading loading-spinner loading-sm" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-base-content/60">
                Aucune notification
              </div>
            ) : (
              notifications.map((notif) => {
                const content = (
                  <div
                    className={`flex gap-3 border-b border-base-300 px-4 py-3 transition-colors hover:bg-base-200 ${
                      !notif.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => {
                      if (!notif.read) handleMarkAsRead(notif.id);
                      if (notif.dossierId) setOpen(false);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        {!notif.read && (
                          <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm truncate ${
                              !notif.read ? 'font-semibold' : 'font-medium'
                            }`}
                          >
                            {notif.title}
                          </p>
                          <p className="mt-0.5 text-xs text-base-content/60 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="mt-1 text-[11px] text-base-content/40">
                            {timeAgo(notif.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );

                if (notif.dossierId) {
                  return (
                    <Link
                      key={notif.id}
                      href={`/espace/mon-dossier`}
                      className="block"
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <div key={notif.id} className="cursor-pointer">
                    {content}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
