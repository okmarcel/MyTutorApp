import { useState, FormEvent } from "react";
import { apiPost } from "../../api/client";
import type { UserRole, UserRequest } from "../../api/types";
type Props = {
    userRole: "STUDENT" | "TUTOR";
    onClose: () => void;
    onDone: () => void;
};
const titles: Record<string, string> = {
    STUDENT: "Dodaj kursanta",
    TUTOR: "Dodaj korepetytora",
};
export function AddUserModal({ userRole, onClose, onDone }: Props) {
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        const fd = new FormData(e.currentTarget);
        const body: UserRequest = {
            firstName: fd.get("firstName") as string,
            lastName: fd.get("lastName") as string,
            email: fd.get("email") as string,
            phoneNumber: (fd.get("phone") as string) || undefined,
            password: "secret",
            role: userRole as UserRole,
        };
        setSaving(true);
        try {
            await apiPost("/api/users", body);
            onDone();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Nie udało się zapisać");
        } finally {
            setSaving(false);
        }
    }
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <form
                className="modal"
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="modal-title">{titles[userRole]}</h2>
                {error && <div className="modal-error">{error}</div>}
                <div className="field">
                    <label>Imię</label>
                    <input className="input" name="firstName" required />
                </div>
                <div className="field">
                    <label>Nazwisko</label>
                    <input className="input" name="lastName" required />
                </div>
                <div className="field">
                    <label>Email</label>
                    <input className="input" type="email" name="email" required />
                </div>
                <div className="field">
                    <label>Telefon</label>
                    <input className="input" name="phone" />
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Anuluj
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Zapisuję..." : titles[userRole]}
                    </button>
                </div>
            </form>
        </div>
    );
}