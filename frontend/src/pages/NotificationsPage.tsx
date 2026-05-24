import styles from "@/pages/simplePage.module.css";
import { useI18n } from "@/i18n/i18n";
import { useApiGet } from "@/api/hooks";
import type { NotificationRow } from "@/api/types";

export function NotificationsPage() {
  const { t } = useI18n();
  const { data, loading, error } = useApiGet<NotificationRow[]>("/api/notifications");
  const notifications = data ?? [];
  const errorText =
    error instanceof Error ? error.message : error ? "Failed to load" : null;

  const severityKey = (sev: string) => (sev === "high" ? "severity.high" : "severity.normal");
  const whenLabel = (createdAtIso: string) => {
    const created = new Date(createdAtIso);
    const now = new Date();
    const days = Math.floor((now.getTime() - created.getTime()) / (24 * 60 * 60 * 1000));
    if (days <= 0) return t("time.today");
    return t("time.days_ago", { days: String(days) });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <button className={styles.primaryButton} type="button">
          {t("notifications.actions.new")}
        </button>
        <button className={styles.ghostButton} type="button">
          {t("notifications.actions.mark_all_read")}
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.list}>
          {notifications.map((n) => (
            <div className={styles.listItem} key={n.id}>
              <div className={styles.listLeft}>
                <div className={styles.primary}>{n.title}</div>
                <div className={styles.secondary}>{n.body}</div>
              </div>
              <div className={styles.listRight}>
                <div className={styles.mono}>{whenLabel(n.createdAt)}</div>
                <span
                  className={
                    n.severity === "high"
                      ? `${styles.badge} ${styles.badgeWarn}`
                      : `${styles.badge} ${styles.badgeInfo}`
                  }
                >
                  {t(severityKey(n.severity))}
                </span>
              </div>
            </div>
          ))}
          {!loading && notifications.length === 0 ? (
            <div className={styles.listItem}>
              <div className={styles.secondary}>{errorText ?? "—"}</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
