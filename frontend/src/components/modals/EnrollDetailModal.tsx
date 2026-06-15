import { useState, useEffect } from "react";
import { apiGet, apiPost } from "../../api/client";
import { formatDatePL } from "../../api/format";
import { OccupancyBar } from "../OccupancyBar";
import type { TutoringGroup, Lesson } from "../../api/types";

type Props = {
    group: TutoringGroup;
    userId: number;
    onClose: () => void;
    onDone: () => void;
};

export function EnrollDetailModal({ group, userId, onClose, onDone }: Props) {
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loadingLessons, setLoadingLessons] = useState(true);

    useEffect(() => {
        apiGet<Lesson[]>(`/api/lessons/group/${group.id}`)
            .then((data) => {
                const planned = data
                    .filter((l) => l.status === "PLANNED")
                    .sort((a, b) => {
                        const d = a.date.localeCompare(b.date);
                        return d !== 0 ? d : a.startTime.localeCompare(b.startTime);
                    });
                setLessons(planned);
            })
            .catch(() => setLessons([]))
            .finally(() => setLoadingLessons(false));
    }, [group.id]);

    async function handleEnroll() {
        setError("");
        setSaving(true);
        try {
            await apiPost(
                `/api/enrollments/student/${userId}/group/${group.id}`
            );
            onDone();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Nie udało się zapisać"
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Szczegóły zajęć</h2>
                {error && <div className="modal-error">{error}</div>}

                <div className="field">
                    <label>Nazwa grupy</label>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>
                        {group.name}
                    </div>
                </div>
                <div className="field">
                    <label>Przedmiot</label>
                    <div>{group.subject}</div>
                </div>
                <div className="field">
                    <label>Poziom</label>
                    <div>{group.level}</div>
                </div>
                {group.tutor && (
                    <div className="field">
                        <label>Korepetytor</label>
                        <div>{group.tutor.fullName}</div>
                    </div>
                )}
                <div className="field">
                    <label>Zajętość</label>
                    <OccupancyBar
                        current={group.activeEnrollmentCount}
                        capacity={group.capacity}
                    />
                </div>

                <div className="field">
                    <label>Nadchodzące zajęcia</label>
                    {loadingLessons ? (
                        <div className="muted" style={{ fontSize: 13 }}>
                            Ładowanie...
                        </div>
                    ) : lessons.length === 0 ? (
                        <div className="muted" style={{ fontSize: 13 }}>
                            Brak zaplanowanych zajęć
                        </div>
                    ) : (
                        <div className="enroll-detail-lessons">
                            {lessons.slice(0, 5).map((l) => (
                                <div key={l.id} className="enroll-detail-lesson">
                                    <span className="enroll-detail-date">
                                        {formatDatePL(l.date)}
                                    </span>
                                    <span className="enroll-detail-time">
                                        {l.startTime.slice(0, 5)} –{" "}
                                        {l.endTime.slice(0, 5)}
                                    </span>
                                </div>
                            ))}
                            {lessons.length > 5 && (
                                <div
                                    className="muted"
                                    style={{ fontSize: 12, marginTop: 4 }}
                                >
                                    ...i {lessons.length - 5} więcej
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                    >
                        Zamknij
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleEnroll}
                        disabled={saving}
                        style={{ marginLeft: "auto" }}
                    >
                        {saving ? "Zapisuję..." : "Zapisz się"}
                    </button>
                </div>
            </div>
        </div>
    );
}
