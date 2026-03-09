import { useCallback, useEffect, useMemo, useState } from 'react';
import { graphqlRequest } from '../lib/graphqlClient';
import type { Notification } from '../types/order';

type NotificationsData = { notifications: Notification[] };

export function useNotifications(token: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await graphqlRequest<NotificationsData, undefined>(
        'query { notifications { id type title message entityType entityId isRead createdAt readAt } }',
        undefined,
        { token },
      );
      setNotifications(data.notifications);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load notifications');
    }
  }, [token]);

  const markRead = useCallback(
    async (notificationId: string) => {
      if (!token) throw new Error('Unauthorized');
      await graphqlRequest<{ markNotificationRead: { id: string } }, { notificationId: string }>(
        'mutation($notificationId: ID!) { markNotificationRead(notificationId: $notificationId) { id } }',
        { notificationId },
        { token },
      );
      await load();
    },
    [token, load],
  );

  useEffect(() => {
    if (!token) return;
    const first = window.setTimeout(() => void load(), 0);
    const timer = window.setInterval(() => void load(), 15000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [token, load]);

  const unreadCount = useMemo(() => notifications.filter((x) => !x.isRead).length, [notifications]);
  return { notifications, unreadCount, error, reload: load, markRead };
}
