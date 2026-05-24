import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/shell/Sidebar";
import styles from "@/shell/appShell.module.css";
import { useI18n } from "@/i18n/i18n";
import { session } from "@/state/session";

function titleKeyForPath(pathname: string) {
  if (pathname.startsWith("/dashboard")) return "nav.dashboard";
  if (pathname.startsWith("/schedule")) return "nav.schedule";
  if (pathname.startsWith("/groups")) return "nav.groups";
  if (pathname.startsWith("/students")) return "nav.students";
  if (pathname.startsWith("/tutors")) return "nav.tutors";
  if (pathname.startsWith("/notifications")) return "nav.notifications";
  return "app.name";
}

export function AppShell() {
  const location = useLocation();
  const { t } = useI18n();
  const pageTitle = t(titleKeyForPath(location.pathname));
  const roleLabel = t(`role.${session.role}`);

  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <div className={styles.kicker}>
              {t("header.kicker", { app: t("app.name"), role: roleLabel })}
            </div>
            <h1 className={styles.title}>{pageTitle}</h1>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.searchWrap}>
              <input
                className={styles.search}
                placeholder={t("header.search_placeholder")}
                aria-label="Search"
              />
            </div>
          </div>
        </header>
        <section className={styles.content}>
          <Outlet />
        </section>
      </main>
    </div>
  );
}
