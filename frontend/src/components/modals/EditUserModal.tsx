import { useState, FormEvent } from "react";
import { apiPut, apiDelete } from "../../api/client";
import type { User } from "../../api/types";
type Props = {
    user: User;
    onClose: () => void;
    onDone: () => void;
};
export function EditUserModal({ user, onClose, onDone }: Props) {
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const title =
        user.role === "STUDENT" ? "Edytuj dane kursanta" : "Edytuj dane korepetytora";
    const deleteLabel =
        user.role === "STUDENT" ? "Usuń kursanta" : "Usuń korepetytora";
    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        const fd = new FormData(e.currentTarget);
        const body = {
            firstName: fd.get("firstName") as string,
            lastName: fd.get("lastName") as string,
            email: fd.get("email") as string,
            phoneNumber: (fd.get("phone") as string) || null,
            password: "",
            role: user.role,
        };
        setSaving(true);
        try {
            await apiPut(`/api/users/${user.id}`, body);
            onDone();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Nie udało się zapisać");
        } finally {
            setSaving(false);
        }
    }
    async function handleDelete() {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }
        setSaving(true);
        try {
            await apiDelete(`/api/users/${user.id}`);
            onDone();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Nie udało się usunąć");
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
                <h2 className="modal-title">{title}</h2>
                {error && <div className="modal-error">{error}</div>}
                <div className="field">
                    <label>Imię</label>
                    <input
                        className="input"
                        name="firstName"
                        defaultValue={user.firstName}
                        required
                    />
                </div>
                <div className="field">
                    <label>Nazwisko</label>
                    <input
                        className="input"
                        name="lastName"
                        defaultValue={user.lastName}
                        required
                    />
                </div>
                <div className="field">
                    <label>Email</label>
                    <input
                        className="input"
                        type="email"
                        name="email"
                        defaultValue={user.email}
                        required
                    />
                </div>
                <div className="field">
                    <label>Telefon</label>
                    <input
                        className="input"
                        name="phone"
                        defaultValue={user.phoneNumber ?? ""}
                    />
                </div>
                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleDelete}
                        disabled={saving}
                    >
                        {confirmDelete ? "Na pewno?" : deleteLabel}
                    </button>
                    <div className="modal-footer-right">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Anuluj
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? "Zapisuję..." : title}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
