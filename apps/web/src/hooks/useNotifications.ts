import { useCallback, useEffect, useMemo, useState } from 'react';
import { graphqlRequest, type RequestOptions } from '../lib/graphqlClient';
import type { Notification } from '../types/order';

type NotificationsData = { notifications: Notification[] };

export function useNotifications(auth: RequestOptions) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isAuthorized = Boolean(auth.token || auth.devAuth);

  const load = useCallback(async () => {
    if (!isAuthorized) return;
    setIsLoading(true);
    try {
      const data = await graphqlRequest<NotificationsData, undefined>(
        'query { notifications { id type title message entityType entityId isRead createdAt readAt } }',
        undefined,
        auth,
      );
      setNotifications(data.notifications);
      setError(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load notifications';
      if (message.includes('"exp" claim timestamp check failed')) return;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorized, auth]);

  const markRead = useCallback(
    async (notificationId: string) => {
      if (!isAuthorized) throw new Error('Unauthorized');
      setReadingId(notificationId);
      try {
        await graphqlRequest<{ markNotificationRead: { id: string } }, { notificationId: string }>(
          'mutation($notificationId: ID!) { markNotificationRead(notificationId: $notificationId) { id } }',
          { notificationId },
          auth,
        );
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to mark notification');
      } finally {
        setReadingId(null);
      }
    },
    [isAuthorized, load, auth],
  );

  useEffect(() => {
    if (!isAuthorized) return;
    const first = window.setTimeout(() => void load(), 0);
    const timer = window.setInterval(() => void load(), 15000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [isAuthorized, load]);

  const unreadCount = useMemo(() => notifications.filter((x) => !x.isRead).length, [notifications]);
  return { notifications, unreadCount, isLoading, readingId, error, reload: load, markRead };
}
