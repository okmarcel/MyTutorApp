import styles from "@/pages/simplePage.module.css";
import { useI18n } from "@/i18n/i18n";
import { useApiGet } from "@/api/hooks";
import type { GroupRow } from "@/api/types";

export function GroupsPage() {
  const { t } = useI18n();
  const { data, loading, error } = useApiGet<GroupRow[]>("/api/groups");
  const groups = data ?? [];
  const errorText =
    error instanceof Error ? error.message : error ? "Failed to load" : null;
  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <button className={styles.primaryButton} type="button">
          {t("groups.actions.create_group")}
        </button>
        <button className={styles.ghostButton} type="button">
          {t("groups.actions.assign_tutor")}
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <div>{t("groups.table.group")}</div>
            <div>{t("groups.table.subject")}</div>
            <div>{t("groups.table.level")}</div>
            <div>{t("groups.table.students")}</div>
            <div>{t("groups.table.primary_tutor")}</div>
          </div>
          {groups.map((g) => (
            <div className={styles.tableRow} key={g.id}>
              <div>
                <div className={styles.primary}>{g.name}</div>
                <div className={styles.secondary}>{g.scheduleHint}</div>
              </div>
              <div>{g.subject}</div>
              <div className={styles.mono}>{g.level}</div>
              <div className={styles.mono}>{g.studentsCount}</div>
              <div>{g.primaryTutor}</div>
            </div>
          ))}
          {!loading && groups.length === 0 ? (
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
