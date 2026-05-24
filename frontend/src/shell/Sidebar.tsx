import { NavLink, useNavigate } from "react-router-dom";
import styles from "@/shell/sidebar.module.css";
import { session } from "@/state/session";
import { useI18n } from "@/i18n/i18n";
import { LanguageToggle } from "@/shell/LanguageToggle";

type NavItem = {
  labelKey: string;
  to: string;
};

const navItems: NavItem[] = [
  { labelKey: "nav.dashboard", to: "/dashboard" },
  { labelKey: "nav.schedule", to: "/schedule" },
  { labelKey: "nav.groups", to: "/groups" },
  { labelKey: "nav.students", to: "/students" },
  { labelKey: "nav.tutors", to: "/tutors" },
  { labelKey: "nav.notifications", to: "/notifications" }
];

export function Sidebar() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brandBlock}>
        <div className={styles.brandRow}>
          <div className={styles.logo} aria-hidden="true">
            MT
          </div>
          <div>
            <div className={styles.brandName}>{t("app.name")}</div>
          </div>
        </div>
        <div className={styles.userRow}>
          <div className={styles.avatar} aria-hidden="true">
            {session.name
              .split(" ")
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase() ?? "")
              .join("")}
          </div>
          <div className={styles.userText}>
            <div className={styles.userName}>{session.name}</div>
            <div className={styles.userHint}>{t(`role.${session.role}`)}</div>
          </div>
        </div>
        <LanguageToggle />
      </div>

      <nav className={styles.nav} aria-label="Primary navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
            }
          >
            <div className={styles.navLabel}>{t(item.labelKey)}</div>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <button
          className={styles.signOut}
          type="button"
          onClick={() => {
            // Prototype-only: no auth backend yet.
            alert(t("sidebar.signed_out_alert"));
            navigate("/dashboard");
          }}
        >
          {t("sidebar.sign_out")}
        </button>
      </div>
    </aside>
  );
}
