import { useMemo, useState } from "react";
import type { Lesson, Enrollment, ModalState } from "../api/types";
import { apiDelete } from "../api/client";
type Props = {
    lessons: Lesson[];
    enrollments: Enrollment[];
    userId: number;
    onOpenModal: (m: ModalState) => void;
    onRefresh: () => void;
};
export function HistoryPage({
                                lessons,
                                enrollments,
                                userId,
                                onOpenModal,
                                onRefresh,
                            }: Props) {
    const [unenrolling, setUnenrolling] = useState<number | null>(null);
    const myEnrollments = useMemo(
        () =>
            enrollments.filter(
                (e) => e.student.id === userId && e.status === "ACTIVE"
            ),
        [enrollments, userId]
    );
    const upcoming = lessons.filter((l) => l.status === "PLANNED");
    const completed = lessons.filter((l) => l.status === "COMPLETED");
    async function handleUnenroll(groupId: number) {
        setUnenrolling(groupId);
        try {
            await apiDelete(`/api/enrollments/student/${userId}/group/${groupId}`);
            onRefresh();
        } catch {
            // silently fail
        } finally {
            setUnenrolling(null);
        }
    }
    return (
        <>
            <h1>Historia zajęć</h1>
            {/* Upcoming lessons */}
            <div className="history-section">
                <h2 className="section-title">Nadchodzące zajęcia</h2>
                {upcoming.length === 0 ? (
                    <div className="panel">
                        <div className="empty-state">Brak nadchodzących zajęć</div>
                    </div>
                ) : (
                    upcoming.map((l) => (
                        <div className="enroll-card" key={l.id}>
                            <div>
                                <div className="enroll-card-name">{l.group.name}</div>
                                <div className="enroll-card-meta">
                                    {l.group.level} | {l.date} | {l.startTime.slice(0, 5)}-
                                    {l.endTime.slice(0, 5)}
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() =>
                                        onOpenModal({ type: "lesson-detail", lesson: l })
                                    }
                                >
                                    Szczegóły
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleUnenroll(l.group.id)}
                                    disabled={unenrolling === l.group.id}
                                >
                                    {unenrolling === l.group.id ? "..." : "Wypisz się"}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {/* Completed lessons */}
            <div className="history-section">
                <h2 className="section-title">Ukończone zajęcia</h2>
                {completed.length === 0 ? (
                    <div className="panel">
                        <div className="empty-state">Brak historii zajęć</div>
                    </div>
                ) : (
                    completed.map((l) => (
                        <div className="enroll-card" key={l.id}>
                            <div>
                                <div className="enroll-card-name">{l.group.name}</div>
                                <div className="enroll-card-meta">
                                    {l.group.level} | {l.date} | {l.startTime.slice(0, 5)}-
                                    {l.endTime.slice(0, 5)}
                                </div>
                            </div>
                            <span className="pill pill-muted">Ukończone</span>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}
