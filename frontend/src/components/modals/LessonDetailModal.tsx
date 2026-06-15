import { useState } from "react";
import { apiDelete, apiPost } from "../../api/client";
import { formatDatePL } from "../../api/format";
import type { Lesson, UserRole } from "../../api/types";
type Props = {
    lesson: Lesson;
    role: UserRole;
    userId: number;
    isEnrolled: boolean;
    onClose: () => void;
    onDone: () => void;
};
export function LessonDetailModal({
                                      lesson,
                                      role,
                                      userId,
                                      isEnrolled,
                                      onClose,
                                      onDone,
                                  }: Props) {
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [confirmAction, setConfirmAction] = useState(false);
    const canDelete = role === "ADMIN" || role === "TUTOR";
    const canEnroll = role === "STUDENT" && !isEnrolled && lesson.group.freePlaces;
    const canUnenroll = role === "STUDENT" && isEnrolled;
    async function handleDelete() {
        if (!confirmAction) {
            setConfirmAction(true);
            return;
        }
        setSaving(true);
        try {
            await apiDelete(`/api/lessons/${lesson.id}`);
            onDone();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Nie udało się usunąć");
        } finally {
            setSaving(false);
        }
    }
    async function handleEnroll() {
        setSaving(true);
        try {
            await apiPost(
                `/api/enrollments/student/${userId}/group/${lesson.group.id}`
            );
            onDone();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Nie udało się zapisać");
        } finally {
            setSaving(false);
        }
    }
    async function handleUnenroll() {
        if (!confirmAction) {
            setConfirmAction(true);
            return;
        }
        setSaving(true);
        try {
            await apiDelete(
                `/api/enrollments/student/${userId}/group/${lesson.group.id}`
            );
            onDone();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Nie udało się wypisać");
        } finally {
            setSaving(false);
        }
    }
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">
                    {canEnroll ? "Zapisz się na zajęcia" : "Szczegóły zajęć"}
                </h2>
                {error && <div className="modal-error">{error}</div>}
                <div className="field">
                    <label>Zajęcia</label>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>
                        {lesson.group.name}
                    </div>
                </div>
                <div className="field">
                    <label>Poziom</label>
                    <div>{lesson.group.level}</div>
                </div>
                <div className="field">
                    <label>Data i godzina</label>
                    <div>
                        {formatDatePL(lesson.date)}
                        <br />
                        {lesson.startTime.slice(0, 5)} - {lesson.endTime.slice(0, 5)}
                    </div>
                </div>
                {lesson.group.tutor && (
                    <div className="field">
                        <label>Korepetytor</label>
                        <div>{lesson.group.tutor.fullName}</div>
                    </div>
                )}
                <div className="modal-footer">
                    {canDelete && (
                        <button
                            className="btn btn-danger"
                            onClick={handleDelete}
                            disabled={saving}
                        >
                            {confirmAction ? "Na pewno?" : "Usuń zajęcia"}
                        </button>
                    )}
                    {canEnroll && (
                        <button
                            className="btn btn-primary"
                            onClick={handleEnroll}
                            disabled={saving}
                        >
                            {saving ? "Zapisuję..." : "Zapisz się"}
                        </button>
                    )}
                    {canUnenroll && (
                        <button
                            className="btn btn-danger"
                            onClick={handleUnenroll}
                            disabled={saving}
                        >
                            {confirmAction ? "Na pewno?" : "Wypisz się"}
                        </button>
                    )}
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                        style={{ marginLeft: "auto" }}
                    >
                        Anuluj
                    </button>
                </div>
            </div>
        </div>
    );
}
