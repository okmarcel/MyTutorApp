import styles from "@/pages/dashboard.module.css";
import { useI18n } from "@/i18n/i18n";
import { useApiGet } from "@/api/hooks";
import type { DashboardResponse, LessonRow, NotificationRow } from "@/api/types";

function KPI({
  labelKey,
  value,
  hintKey
}: {
  labelKey: string;
  value: string;
  hintKey: string;
}) {
  const { t } = useI18n();
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiTop}>
        <div className={styles.kpiLabel}>{t(labelKey)}</div>
        <div className={styles.kpiHint}>{t(hintKey)}</div>
      </div>
      <div className={styles.kpiValue}>{value}</div>
    </div>
  );
}

export function DashboardPage() {
  const { t } = useI18n();
  const { data, loading, error } = useApiGet<DashboardResponse>("/api/dashboard");

  const kpiCards = [
    {
      labelKey: "dashboard.kpi.active_students",
      hintKey: "dashboard.kpi_hint.active_students",
      value: data ? String(data.kpis.activeStudents) : "—"
    },
    {
      labelKey: "dashboard.kpi.tutors",
      hintKey: "dashboard.kpi_hint.tutors",
      value: data ? String(data.kpis.tutors) : "—"
    },
    {
      labelKey: "dashboard.kpi.group_count",
      hintKey: "dashboard.kpi_hint.group_count",
      value: data ? String(data.kpis.groupCount) : "—"
    },
    {
      labelKey: "dashboard.kpi.classes_this_week",
      hintKey: "dashboard.kpi_hint.classes_this_week",
      value: data ? String(data.kpis.classesThisWeek) : "—"
    }
  ] as const;

  const lessons: LessonRow[] = data?.todaysLessons ?? [];
  const notifications: NotificationRow[] = data?.notifications ?? [];

  function formatTimeRange(startAtIso: string, endAtIso: string) {
    const start = new Date(startAtIso);
    const end = new Date(endAtIso);
    const fmt = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });
    return `${fmt.format(start)}–${fmt.format(end)}`;
  }

  function whenLabel(n: NotificationRow) {
    const created = new Date(n.createdAt);
    const now = new Date();
    const days = Math.floor((now.getTime() - created.getTime()) / (24 * 60 * 60 * 1000));
    if (days <= 0) return t("time.today");
    if (days < 7) return t("time.this_week");
    return t("time.days_ago", { days: String(days) });
  }

  const errorText =
    error instanceof Error ? error.message : error ? "Failed to load" : null;

  return (
    <div className={styles.grid}>
      <section className={styles.kpiRow} aria-label="Key metrics">
        {kpiCards.map((k) => (
          <KPI
            key={k.labelKey}
            labelKey={k.labelKey}
            value={k.value}
            hintKey={k.hintKey}
          />
        ))}
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <div className={styles.cardKicker}>{t("dashboard.today.kicker")}</div>
            <h2 className={styles.cardTitle}>{t("dashboard.today.title")}</h2>
          </div>
          <button className={styles.cardAction} type="button">
            {t("dashboard.today.action")}
          </button>
        </div>
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <div>{t("lessons.table.time")}</div>
            <div>{t("lessons.table.group")}</div>
            <div>{t("lessons.table.tutor")}</div>
            <div>{t("lessons.table.room")}</div>
            <div>{t("lessons.table.status")}</div>
          </div>
          {lessons.map((l) => (
            <div className={styles.tableRow} key={l.id}>
              <div className={styles.mono}>{formatTimeRange(l.startAt, l.endAt)}</div>
              <div>
                <div className={styles.primary}>{l.groupName}</div>
                <div className={styles.secondary}>{l.subject}</div>
              </div>
              <div>{l.tutorName}</div>
              <div className={styles.mono}>{l.room}</div>
              <div>
                <span
                  className={
                    l.status === "on_time"
                      ? `${styles.badge} ${styles.badgeOk}`
                      : l.status === "needs_attention"
                        ? `${styles.badge} ${styles.badgeWarn}`
                        : `${styles.badge} ${styles.badgeInfo}`
                  }
                >
                  {t(`lesson.status.${l.status}`)}
                </span>
              </div>
            </div>
          ))}
          {!loading && lessons.length === 0 ? (
            <div className={styles.tableRow}>
              <div className={styles.secondary} style={{ gridColumn: "1 / -1" }}>
                {errorText ?? "—"}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <div className={styles.cardKicker}>{t("dashboard.inbox.kicker")}</div>
            <h2 className={styles.cardTitle}>{t("dashboard.inbox.title")}</h2>
          </div>
          <button className={styles.cardAction} type="button">
            {t("dashboard.inbox.action")}
          </button>
        </div>
        <div className={styles.list}>
          {notifications.map((n) => (
            <div className={styles.listItem} key={n.id}>
              <div className={styles.listLeft}>
                <div className={styles.primary}>{n.title}</div>
                <div className={styles.secondary}>{n.body}</div>
              </div>
              <div className={styles.listRight}>
                <div className={styles.mono}>{whenLabel(n)}</div>
                <span
                  className={
                    n.severity === "high"
                      ? `${styles.badge} ${styles.badgeWarn}`
                      : `${styles.badge} ${styles.badgeInfo}`
                  }
                >
                  {t(n.severity === "high" ? "severity.high" : "severity.normal")}
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
      </section>
    </div>
  );
}
