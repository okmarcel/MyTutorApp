import { useState, FormEvent } from "react";
import { apiGet } from "../api/client";
import type { UserRole, User } from "../api/types";
type Props = {
    onLogin: (role: UserRole, userId: number, username: string) => void;
};
const roleNames: Record<UserRole, string> = {
    ADMIN: "Administrator",
    TUTOR: "Korepetytor",
    STUDENT: "Kursant",
};
export function LoginPage({ onLogin }: Props) {
    const [role, setRole] = useState<UserRole>("ADMIN");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const users = await apiGet<User[]>("/api/users");
            const user = users.find((u) => u.role === role);
            if (!user) {
                setError(
                    `Brak użytkownika z rolą „${roleNames[role]}". Dodaj go najpierw jako administrator.`
                );
                setLoading(false);
                return;
            }
            onLogin(role, user.id, user.fullName);
        } catch {
            // If the API is unreachable, log in with dummy data for demo purposes
            onLogin(role, 1, role.toLowerCase() + "1");
        } finally {
            setLoading(false);
        }
    }
    return (
        <main className="login-page">
            <form className="login-card" onSubmit={handleSubmit}>
                <div className="login-brand">MyTutor</div>
                <div className="login-subtitle">
                    System zarządzania szkołą korepetycji
                </div>
                {error && <div className="modal-error">{error}</div>}
                <div className="field">
                    <label>Email</label>
                    <input className="input" placeholder="Email" />
                </div>
                <div className="field">
                    <label>Hasło</label>
                    <input className="input" type="password" placeholder="******" />
                </div>
                <div className="role-section-label">Zaloguj się jako:</div>
                <div className="role-list">
                    {(Object.keys(roleNames) as UserRole[]).map((r) => (
                        <button
                            type="button"
                            className={`role-option ${role === r ? "active" : ""}`}
                            onClick={() => setRole(r)}
                            key={r}
                        >
                            <span className="radio" />
                            {roleNames[r]}
                        </button>
                    ))}
                </div>
                <button className="btn btn-primary btn-block" disabled={loading}>
                    {loading ? "Logowanie..." : "Zaloguj się"}
                </button>
            </form>
        </main>
    );
}
