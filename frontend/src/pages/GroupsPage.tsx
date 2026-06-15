import { useState, useMemo } from "react";
import type { TutoringGroup, ModalState, View } from "../api/types";
import { OccupancyBar } from "../components/OccupancyBar";
type Props = {
    groups: TutoringGroup[];
    onOpenModal: (m: ModalState) => void;
    onNavigate: (v: View, groupId?: number) => void;
};
export function GroupsPage({ groups, onOpenModal, onNavigate }: Props) {
    const [search, setSearch] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [levelFilter, setLevelFilter] = useState("");
    const subjects = useMemo(
        () => [...new Set(groups.map((g) => g.subject))].sort(),
        [groups]
    );
    const levels = useMemo(
        () => [...new Set(groups.map((g) => g.level))].sort(),
        [groups]
    );
    const filtered = groups.filter((g) => {
        if (search && !g.name.toLowerCase().includes(search.toLowerCase()))
            return false;
        if (subjectFilter && g.subject !== subjectFilter) return false;
        if (levelFilter && g.level !== levelFilter) return false;
        return true;
    });
    return (
        <>
            <div className="page-header">
                <h1>Grupy</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => onOpenModal({ type: "create-group" })}
                >
                    + Utwórz grupę
                </button>
            </div>
            <div className="toolbar">
                <input
                    className="input"
                    placeholder="Wyszukaj grupę..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className="input select-input"
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                >
                    <option value="">Wszystkie przedmioty</option>
                    {subjects.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
                <select
                    className="input select-input"
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                >
                    <option value="">Wszystkie poziomy</option>
                    {levels.map((l) => (
                        <option key={l} value={l}>
                            {l}
                        </option>
                    ))}
                </select>
            </div>
            <div className="groups-grid">
                {filtered.length === 0 && (
                    <div className="empty-state">Brak grup</div>
                )}
                {filtered.map((g) => (
                    <div className="group-card" key={g.id}>
                        <div className="group-card-header">
                            <div>
                                <div className="group-card-name">{g.name}</div>
                                <div className="group-card-meta">
                                    {g.subject} · Poziom: {g.level}
                                    <br />
                                    Korepetytor: {g.tutor?.fullName ?? "Brak"}
                                </div>
                            </div>
                        </div>
                        <div className="group-card-footer">
                            <OccupancyBar
                                current={g.activeEnrollmentCount}
                                capacity={g.capacity}
                            />
                            <div style={{ display: "flex", gap: 8 }}>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => onNavigate("group-detail", g.id)}
                                >
                                    Uczestnicy
                                </button>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() =>
                                        onOpenModal({ type: "edit-group", group: g })
                                    }
                                >
                                    Zarządzaj grupą
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
