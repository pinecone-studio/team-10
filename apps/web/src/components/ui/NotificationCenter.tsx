import { formatDateTime } from '../../lib/format';
import type { Notification } from '../../types/order';

type NotificationCenterProps = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  readingId: string | null;
  error: string | null;
  onRead: (notificationId: string) => Promise<void>;
};

export function NotificationCenter({ notifications, unreadCount, isLoading, readingId, error, onRead }: NotificationCenterProps) {
  return (
    <section className="panel">
      <div className="notif-head">
        <h2>Notifications</h2>
        <span className="notif-count">{unreadCount} unread</span>
      </div>
      {isLoading ? <p className="row-meta">Loading notifications...</p> : null}
      {unreadCount > 0 ? (
        <div className="notif-alert">
          <span className="notif-dot" aria-hidden="true" />
          <strong>You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}.</strong>
        </div>
      ) : null}
      {error ? <p className="inline-error">{error}</p> : null}
      {!isLoading && !notifications.length ? <p className="row-meta">No notifications yet.</p> : null}
      <div className="notif-list">
        {notifications.map((n) => (
          <article key={n.id} className={`notif-item ${n.isRead ? 'read' : ''}`.trim()}>
            <strong>{n.title}</strong>
            <p>{n.message}</p>
            <div className="notif-meta">
              <span>{formatDateTime(n.createdAt)}</span>
              {!n.isRead ? (
                <button type="button" className="button-muted" disabled={readingId === n.id} onClick={() => void onRead(n.id)}>
                  {readingId === n.id ? 'Marking...' : 'Mark read'}
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
