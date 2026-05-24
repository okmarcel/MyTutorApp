import { useI18n } from "@/i18n/i18n";
import styles from "@/shell/languageToggle.module.css";

export function LanguageToggle() {
  const { lang, setLang, t } = useI18n();

  return (
    <div className={styles.wrap} aria-label={t("lang.label")}>
      <div className={styles.label}>{t("lang.label")}</div>
      <div className={styles.segmented} role="group" aria-label={t("lang.label")}>
        <button
          type="button"
          className={lang === "en" ? `${styles.btn} ${styles.btnActive}` : styles.btn}
          onClick={() => setLang("en")}
          aria-pressed={lang === "en"}
          title={t("lang.english")}
        >
          {t("lang.english")}
        </button>
        <button
          type="button"
          className={lang === "pl" ? `${styles.btn} ${styles.btnActive}` : styles.btn}
          onClick={() => setLang("pl")}
          aria-pressed={lang === "pl"}
          title={t("lang.polish")}
        >
          {t("lang.polish")}
        </button>
      </div>
    </div>
  );
}

