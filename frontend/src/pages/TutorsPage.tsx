import styles from "@/pages/simplePage.module.css";
import { useI18n } from "@/i18n/i18n";
import { useApiGet } from "@/api/hooks";
import type { TutorRow } from "@/api/types";

export function TutorsPage() {
  const { t } = useI18n();
  const { data, loading, error } = useApiGet<TutorRow[]>("/api/tutors");
  const tutors = data ?? [];
  const errorText =
    error instanceof Error ? error.message : error ? "Failed to load" : null;

  const statusKey = (status: string) => {
    if (status === "active") return "status.active";
    if (status === "onboarding") return "status.onboarding";
    return "status.active";
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <button className={styles.primaryButton} type="button">
          {t("tutors.actions.add_tutor")}
        </button>
        <button className={styles.ghostButton} type="button">
          {t("tutors.actions.invite")}
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <div>{t("tutors.table.tutor")}</div>
            <div>{t("tutors.table.subjects")}</div>
            <div>{t("tutors.table.groups")}</div>
            <div>{t("tutors.table.availability")}</div>
            <div>{t("tutors.table.status")}</div>
          </div>
          {tutors.map((tutor) => (
            <div className={styles.tableRow} key={tutor.id}>
              <div>
                <div className={styles.primary}>{tutor.name}</div>
                <div className={styles.secondary}>{tutor.email}</div>
              </div>
              <div>{tutor.subjects.split(",").join(", ")}</div>
              <div className={styles.mono}>{tutor.groupsCount}</div>
              <div className={styles.secondary}>{tutor.availability}</div>
              <div>
                <span
                  className={
                    tutor.status === "active"
                      ? `${styles.badge} ${styles.badgeOk}`
                      : `${styles.badge} ${styles.badgeWarn}`
                  }
                >
                  {t(statusKey(tutor.status))}
                </span>
              </div>
            </div>
          ))}
          {!loading && tutors.length === 0 ? (
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
