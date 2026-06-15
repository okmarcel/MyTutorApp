import { useState, useMemo } from "react";
import type { User, TutoringGroup, ModalState } from "../api/types";
type Props = {
    users: User[];
    groups: TutoringGroup[];
    onOpenModal: (m: ModalState) => void;
};
export function TutorsPage({ users, groups, onOpenModal }: Props) {
    const [search, setSearch] = useState("");
    const tutors = useMemo(
        () => users.filter((u) => u.role === "TUTOR"),
        [users]
    );
    const filtered = tutors.filter((t) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            t.fullName.toLowerCase().includes(q) ||
            t.email.toLowerCase().includes(q)
        );
    });
    function groupCount(tutorId: number): number {
        return groups.filter((g) => g.tutor?.id === tutorId).length;
    }
    return (
        <>
            <div className="page-header">
                <h1>Korepetytorzy</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => onOpenModal({ type: "add-tutor" })}
                >
                    + Dodaj korepetytora
                </button>
            </div>
            <div className="toolbar">
                <input
                    className="input"
                    placeholder="Wyszukaj korepetytora..."
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
                        <th>Liczba grup</th>
                        <th>Akcje</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.map((t) => (
                        <tr key={t.id}>
                            <td>{t.fullName}</td>
                            <td>{t.email}</td>
                            <td>{t.phoneNumber ?? "—"}</td>
                            <td>{groupCount(t.id)}</td>
                            <td>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() =>
                                        onOpenModal({ type: "edit-user", user: t })
                                    }
                                >
                                    Edytuj
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={5} className="empty-state">
                                Brak korepetytorów
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
