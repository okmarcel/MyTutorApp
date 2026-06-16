import { useState, useMemo } from "react";
import type { User, ModalState, UserRole } from "../api/types";
type Props = {
    users: User[];
    role: UserRole;
    onOpenModal: (m: ModalState) => void;
};
export function StudentsPage({ users, role, onOpenModal }: Props) {
    const [search, setSearch] = useState("");
    const students = useMemo(
        () => users.filter((u) => u.role === "STUDENT"),
        [users]
    );
    const filtered = students.filter((s) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            s.fullName.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q)
        );
    });
    return (
        <>
            <div className="page-header">
                <h1>Kursanci</h1>
                {role === "ADMIN" && (
                    <button
                        className="btn btn-primary"
                        onClick={() => onOpenModal({ type: "add-student" })}
                    >
                        + Dodaj kursanta
                    </button>
                )}
            </div>
            <div className="toolbar">
                <input
                    className="input"
                    placeholder="Wyszukaj kursanta..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="table-wrap">
                <table className="table">
                    <thead>
                    <tr>
                        <th>Imię i nazwisko</th>
                        <th>Email</th>
                        <th>Telefon</th>
                        {role === "ADMIN" && <th>Akcje</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.map((s) => (
                        <tr key={s.id}>
                            <td>{s.fullName}</td>
                            <td>{s.email}</td>
                            <td>{s.phoneNumber ?? "—"}</td>
                            {role === "ADMIN" && (
                                <td>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() =>
                                            onOpenModal({ type: "edit-user", user: s })
                                        }
                                    >
                                        Edytuj
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={role === "ADMIN" ? 4 : 3} className="empty-state">
                                Brak kursantów
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
