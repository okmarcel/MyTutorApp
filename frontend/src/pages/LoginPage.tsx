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

  async function loginWith(nextEmail: string, nextPassword: string) {
    const trimmedEmail = nextEmail.trim();
    const trimmedPassword = nextPassword.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Wypełnij oba pola");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const user = await apiPost<User>("/api/auth/login", {
        email: trimmedEmail,
        password: trimmedPassword,
      });
      onLogin(user.role, user.id, user.fullName);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nieprawidłowy email lub hasło"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await loginWith(email, password);
  }

  async function quickLogin(nextEmail: string, nextPassword: string) {
    setEmail(nextEmail);
    setPassword(nextPassword);
    await loginWith(nextEmail, nextPassword);
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
          <strong>Szybkie logowanie:</strong>
          <div className="quick-login-buttons">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => quickLogin("admin@mytutor.pl", "admin123")}
              disabled={loading}
            >
              Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => quickLogin("anna.nowak@mytutor.pl", "tutor123")}
              disabled={loading}
            >
              Korepetytor
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => quickLogin("kasia.z@student.pl", "student123")}
              disabled={loading}
            >
              Kursant
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
