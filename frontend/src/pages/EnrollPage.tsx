import { useState, useMemo } from "react";
import type { TutoringGroup, Enrollment, ModalState } from "../api/types";
type Props = {
    groups: TutoringGroup[];
    enrollments: Enrollment[];
    userId: number;
    onOpenModal: (m: ModalState) => void;
    onRefresh: () => void;
};
export function EnrollPage({
                               groups,
                               enrollments,
                               userId,
                               onOpenModal,
                               onRefresh,
                           }: Props) {
    const [search, setSearch] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [levelFilter, setLevelFilter] = useState("");
    const enrolledGroupIds = useMemo(
        () =>
            new Set(
                enrollments
                    .filter((e) => e.student.id === userId && e.status === "ACTIVE")
                    .map((e) => e.group.id)
            ),
        [enrollments, userId]
    );

    const available = groups.filter((g) => {
        if (enrolledGroupIds.has(g.id)) return false;
        if (!g.freePlaces) return false;
        if (search && !g.name.toLowerCase().includes(search.toLowerCase()))
            return false;
        if (subjectFilter && g.subject !== subjectFilter) return false;
        if (levelFilter && g.level !== levelFilter) return false;
        return true;
    });
    const subjects = useMemo(
        () => [...new Set(groups.map((g) => g.subject))].sort(),
        [groups]
    );
    const levels = useMemo(
        () => [...new Set(groups.map((g) => g.level))].sort(),
        [groups]
    );
    return (
        <>
            <h1>Zapis na zajęcia</h1>
            <div className="toolbar">
                <input
                    className="input"
                    placeholder="Wyszukaj zajęcia..."
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
            {available.length === 0 && (
                <div className="empty-state">Brak dostępnych zajęć</div>
            )}
            {available.map((g) => (
                <div className="enroll-card" key={g.id}>
                    <div>
                        <div className="enroll-card-name">{g.name}</div>
                        <div className="enroll-card-meta">
                            {g.level} · {g.subject}
                            {g.tutor ? ` · ${g.tutor.fullName}` : ""}
                        </div>
                    </div>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                            onOpenModal({ type: "enroll-group", group: g })
                        }
                    >
                        Szczegóły
                    </button>
                </div>
            ))}
        </>
    );
}

