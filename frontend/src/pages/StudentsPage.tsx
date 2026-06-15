import { useState, useMemo } from "react";
import type { User, ModalState } from "../api/types";
type Props = {
    users: User[];
    onOpenModal: (m: ModalState) => void;
};
export function StudentsPage({ users, onOpenModal }: Props) {
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
                <button
                    className="btn btn-primary"
                    onClick={() => onOpenModal({ type: "add-student" })}
                >
                    + Dodaj kursanta
                </button>
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
                        <th>Akcje</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.map((s) => (
                        <tr key={s.id}>
                            <td>{s.fullName}</td>
                            <td>{s.email}</td>
                            <td>{s.phoneNumber ?? "—"}</td>
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
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={4} className="empty-state">
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
