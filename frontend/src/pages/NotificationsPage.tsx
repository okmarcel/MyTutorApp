import type { Notification as Notif } from "../api/types";
import { apiPut } from "../api/client";
type Props = {
    notifications: Notif[];
    userId: number;
    onRefresh: () => void;
};
export function NotificationsPage({ notifications, userId, onRefresh }: Props) {
    async function markAsRead(id: number) {
        try {
            await apiPut(`/api/notifications/${id}/read?userId=${userId}`);
            onRefresh();
        } catch {
            // silently fail
        }
    }
    return (
        <>
            <h1>Powiadomienia</h1>
            <div className="panel mt-4">
                {notifications.length === 0 && (
                    <div className="empty-state">Brak powiadomień</div>
                )}
                {notifications.map((n) => (
                    <div
                        className={`notification-item ${n.status === "UNREAD" ? "unread" : ""}`}
                        key={n.id}
                        onClick={() => n.status === "UNREAD" && markAsRead(n.id)}
                        style={{ cursor: n.status === "UNREAD" ? "pointer" : undefined }}
                    >
                        <div>
                            <div className="notification-title">{n.title}</div>
                            <div className="notification-body">{n.content}</div>
                            <div className="notification-date">
                                {n.createdAt.slice(0, 10)}
                            </div>
                        </div>
                        <div className="notification-actions">
              <span
                  className={`pill ${n.status === "UNREAD" ? "pill-primary" : "pill-muted"}`}
              >
                {n.status === "UNREAD" ? "Nowe" : "Odczytane"}
              </span>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
