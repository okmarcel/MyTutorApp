import styles from "@/pages/simplePage.module.css";
import { useI18n } from "@/i18n/i18n";
import { useApiGet } from "@/api/hooks";
import type { StudentRow } from "@/api/types";

export function StudentsPage() {
  const { t } = useI18n();
  const { data, loading, error } = useApiGet<StudentRow[]>("/api/students");
  const students = data ?? [];
  const errorText =
    error instanceof Error ? error.message : error ? "Failed to load" : null;

  const statusKey = (status: string) => {
    if (status === "active") return "status.active";
    if (status === "on_hold") return "status.on_hold";
    return "status.active";
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <button className={styles.primaryButton} type="button">
          {t("students.actions.add_student")}
        </button>
        <button className={styles.ghostButton} type="button">
          {t("students.actions.import_csv")}
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <div>{t("students.table.student")}</div>
            <div>{t("students.table.grade")}</div>
            <div>{t("students.table.active_groups")}</div>
            <div>{t("students.table.guardian")}</div>
            <div>{t("students.table.status")}</div>
          </div>
          {students.map((s) => (
            <div className={styles.tableRow} key={s.id}>
              <div>
                <div className={styles.primary}>{s.name}</div>
                <div className={styles.secondary}>{s.email}</div>
              </div>
              <div className={styles.mono}>{s.grade}</div>
              <div className={styles.mono}>{s.activeGroups}</div>
              <div>{s.guardian}</div>
              <div>
                <span
                  className={
                    s.status === "active"
                      ? `${styles.badge} ${styles.badgeOk}`
                      : `${styles.badge} ${styles.badgeInfo}`
                  }
                >
                  {t(statusKey(s.status))}
                </span>
              </div>
            </div>
          ))}
          {!loading && students.length === 0 ? (
            <div className={styles.tableRow}>
              <div className={styles.secondary} style={{ gridColumn: "1 / -1" }}>
                {errorText ?? "—"}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
