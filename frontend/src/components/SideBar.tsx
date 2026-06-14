import type { UserRole, View } from "../api/types";

const roleNames: Record<UserRole, string> = {
    ADMIN: "Administrator",
    TUTOR: "Korepetytor",
    STUDENT: "Kursant",
};

type SidebarProps = {
    role: UserRole;
    username: string;
    view: View;
    setView: (v: View) => void;
    unread: number;
    onLogout: () => void;
};
export function Sidebar({ role, username, view, setView, unread, onLogout }: SidebarProps) {
    const items: { v: View; label: string }[] =
        role === "ADMIN"
            ? [
                { v: "dashboard", label: "Panel główny" },
                { v: "schedule", label: "Harmonogram" },
                { v: "groups", label: "Grupy" },
                { v: "students", label: "Kursanci" },
                { v: "tutors", label: "Korepetytorzy" },
                { v: "notifications", label: "Powiadomienia" },
            ]
            : role === "TUTOR"
                ? [
                    { v: "dashboard", label: "Panel główny" },
                    { v: "schedule", label: "Mój harmonogram" },
                    { v: "groups", label: "Moje grupy" },
                    { v: "students", label: "Kursanci" },
                    { v: "notifications", label: "Powiadomienia" },
                ]
                : [
                    { v: "dashboard", label: "Panel główny" },
                    { v: "schedule", label: "Mój harmonogram" },
                    { v: "enroll", label: "Zapis na zajęcia" },
                    { v: "history", label: "Historia zajęć" },
                    { v: "notifications", label: "Powiadomienia" },
                ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-brand">MyTutor</div>
                <div className="sidebar-user">
                    <strong>{roleNames[role]}</strong>
                    {username}
                </div>
            </div>
            <nav className="sidebar-nav">
                {items.map((item) => (
                    <button
                        key={item.v}
                        className={view === item.v ? "active" : ""}
                        onClick={() => setView(item.v)}
                    >
                        <span>{item.label}</span>
                        {item.v === "notifications" && unread > 0 && (
                            <span className="sidebar-badge">{unread}</span>
                        )}
                    </button>
                ))}
            </nav>
            <div className="sidebar-footer">
                <button className="btn btn-secondary btn-block" onClick={onLogout}>
                    Wyloguj
                </button>
            </div>
        </aside>
    );
}

export function MobileNav({
                              role,
                              view,
                              setView,
                          }: {
    role: UserRole;
    view: View;
    setView: (v: View) => void;
}) {
    const items: { v: View; label: string }[] =
        role === "ADMIN"
            ? [
                { v: "dashboard", label: "Panel" },
                { v: "schedule", label: "Harmonogram" },
                { v: "groups", label: "Grupy" },
                { v: "students", label: "Kursanci" },
                { v: "tutors", label: "Korepetytorzy" },
                { v: "notifications", label: "Powiadomienia" },
            ]
            : role === "TUTOR"
                ? [
                    { v: "dashboard", label: "Panel" },
                    { v: "schedule", label: "Harmonogram" },
                    { v: "groups", label: "Grupy" },
                    { v: "students", label: "Kursanci" },
                    { v: "notifications", label: "Powiadomienia" },
                ]
                : [
                    { v: "dashboard", label: "Panel" },
                    { v: "schedule", label: "Harmonogram" },
                    { v: "enroll", label: "Zapis" },
                    { v: "history", label: "Historia" },
                    { v: "notifications", label: "Powiadomienia" },
                ];

    return (
        <div className="mobile-nav">
            {items.map((item) => (
                <button
                    key={item.v}
                    className={`btn ${view === item.v ? "btn-primary" : "btn-secondary"} btn-sm`}
                    onClick={() => setView(item.v)}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}
