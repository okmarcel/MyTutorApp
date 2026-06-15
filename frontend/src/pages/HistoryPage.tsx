import { useMemo, useState } from "react";
import type { Lesson, Enrollment, ModalState } from "../api/types";
import { apiDelete } from "../api/client";
import { formatDatePL } from "../api/format";
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
    const [confirmGroupId, setConfirmGroupId] = useState<number | null>(null);
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
        if (confirmGroupId !== groupId) {
            setConfirmGroupId(groupId);
            return;
        }
        setUnenrolling(groupId);
        try {
            await apiDelete(`/api/enrollments/student/${userId}/group/${groupId}`);
            onRefresh();
        } catch {

        } finally {
            setUnenrolling(null);
            setConfirmGroupId(null);
        }
    }
    return (
        <>
            <h1>Historia zajęć</h1>

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
                                    {l.group.level} | {formatDatePL(l.date)} | {l.startTime.slice(0, 5)}-
                                    {l.endTime.slice(0, 5)}
                                </div>
                            </div>
                            <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleUnenroll(l.group.id)}
                                    disabled={unenrolling === l.group.id}
                                >
                                    {unenrolling === l.group.id
                                        ? "..."
                                        : confirmGroupId === l.group.id
                                            ? "Na pewno?"
                                            : "Wypisz się"}
                                </button>
                        </div>
                    ))
                )}
            </div>

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
                                    {l.group.level} | {formatDatePL(l.date)} | {l.startTime.slice(0, 5)}-
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
