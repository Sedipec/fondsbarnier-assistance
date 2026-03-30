import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, and, desc, count } from 'drizzle-orm';

export type NotificationType =
  | 'etape_change'
  | 'document_validated'
  | 'payment_confirmed'
  | 'note_added'
  | 'system';

/**
 * Cree une notification pour un utilisateur.
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  dossierId?: string,
) {
  const [notification] = await db
    .insert(notifications)
    .values({
      userId,
      type,
      title,
      message,
      dossierId: dossierId ?? null,
    })
    .returning();

  return notification;
}

/**
 * Recupere le nombre de notifications non lues pour un utilisateur.
 */
export async function getUnreadCount(userId: string) {
  const [result] = await db
    .select({ value: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.read, false),
      ),
    );

  return result?.value ?? 0;
}

/**
 * Recupere les notifications d'un utilisateur avec pagination.
 */
export async function getUserNotifications(
  userId: string,
  { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {},
) {
  const [totalResult] = await db
    .select({ value: count() })
    .from(notifications)
    .where(eq(notifications.userId, userId));

  const data = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);

  return { data, count: totalResult?.value ?? 0 };
}

/**
 * Marque une notification comme lue (verifie que l'utilisateur en est le proprietaire).
 */
export async function markAsRead(notificationId: string, userId: string) {
  const [updated] = await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
      ),
    )
    .returning();

  return updated ?? null;
}

/**
 * Marque toutes les notifications d'un utilisateur comme lues.
 */
export async function markAllAsRead(userId: string) {
  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.read, false),
      ),
    );
}
