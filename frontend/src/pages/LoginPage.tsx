import { useState, FormEvent } from "react";
import { apiPost } from "../api/client";
import type { UserRole, User } from "../api/types";

type Props = {
  onLogin: (role: UserRole, userId: number, username: string) => void;
};

export function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Wypełnij oba pola");
      return;
    }

    setLoading(true);
    try {
      const user = await apiPost<User>("/api/auth/login", { email, password });
      onLogin(user.role, user.id, user.fullName);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nieprawidłowy email lub hasło"
      );
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
          <input
            className="input"
            type="email"
            placeholder="jan@mytutor.pl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
        </div>
        <div className="field">
          <label>Hasło</label>
          <input
            className="input"
            type="password"
            placeholder="••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? "Logowanie..." : "Zaloguj się"}
        </button>

        <div className="login-hint">
          <strong>Konta testowe:</strong>
          <table className="login-hint-table">
            <tbody>
              <tr>
                <td>Admin</td>
                <td>admin@mytutor.pl</td>
                <td>admin123</td>
              </tr>
              <tr>
                <td>Korepetytor</td>
                <td>anna.nowak@mytutor.pl</td>
                <td>tutor123</td>
              </tr>
              <tr>
                <td>Kursant</td>
                <td>kasia.z@student.pl</td>
                <td>student123</td>
              </tr>
            </tbody>
          </table>
        </div>
      </form>
    </main>
  );
}
