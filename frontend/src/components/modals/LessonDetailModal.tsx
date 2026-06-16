import { useState } from "react";
import { apiDelete, apiPost, apiPut } from "../../api/client";
import { formatDatePL } from "../../api/format";
import type { Lesson, LessonRequest, TutoringGroup, UserRole } from "../../api/types";
type Props = {
    lesson: Lesson;
    groups: TutoringGroup[];
    role: UserRole;
    userId: number;
    isEnrolled: boolean;
    onClose: () => void;
    onDone: () => void;
};
export function LessonDetailModal({
                                      lesson,
                                      groups,
                                      role,
                                      userId,
                                      isEnrolled,
                                      onClose,
                                      onDone,
                                  }: Props) {
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [confirmAction, setConfirmAction] = useState(false);
    const [note, setNote] = useState(lesson.note ?? "");
    const [editingLesson, setEditingLesson] = useState(false);
    const [editGroupId, setEditGroupId] = useState(String(lesson.group.id));
    const [editDate, setEditDate] = useState(lesson.date);
    const [editStartTime, setEditStartTime] = useState(lesson.startTime.slice(0, 5));
    const [editEndTime, setEditEndTime] = useState(lesson.endTime.slice(0, 5));
    const canEdit = role === "ADMIN" || role === "TUTOR";
    const canDelete = canEdit;
    const canEnroll = role === "STUDENT" && !isEnrolled && lesson.group.freePlaces;
    const canUnenroll = role === "STUDENT" && isEnrolled;
    const availableGroups = groups.length > 0 ? groups : [lesson.group];
    const selectedGroup = availableGroups.find((g) => g.id === Number(editGroupId)) ?? lesson.group;
    async function handleSaveLesson() {
        setError("");
        const body: LessonRequest = {
            groupId: Number(editGroupId),
            date: editDate,
            startTime: editStartTime,
            endTime: editEndTime,
        };
        if (!body.groupId || !body.date || !body.startTime || !body.endTime) {
            setError("Wypełnij wszystkie pola terminu");
            return;
        }
        setSaving(true);
        try {
            await apiPut(`/api/lessons/${lesson.id}`, body);
            onDone();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Nie udało się zapisać zmian");
        } finally {
            setSaving(false);
        }
    }
    async function handleSaveNote() {
        setSaving(true);
        setError("");
        try {
            await apiPut(`/api/lessons/${lesson.id}/note`, { note: note || null });
            onDone();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Nie udało się zapisać notatki");
        } finally {
            setSaving(false);
        }
    }
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
                    {editingLesson ? (
                        <select
                            className="input select-input"
                            value={editGroupId}
                            onChange={(e) => setEditGroupId(e.target.value)}
                        >
                            {availableGroups.map((group) => (
                                <option value={group.id} key={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div style={{ fontSize: 16, fontWeight: 600 }}>
                            {lesson.group.name}
                        </div>
                    )}
                </div>
                <div className="field">
                    <label>Poziom</label>
                    <div>{editingLesson ? selectedGroup.level : lesson.group.level}</div>
                </div>
                <div className="field">
                    <label>Data i godzina</label>
                    {editingLesson ? (
                        <>
                            <input
                                className="input"
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                            />
                            <div className="two-col" style={{ marginTop: 12 }}>
                                <input
                                    className="input"
                                    type="time"
                                    value={editStartTime}
                                    onChange={(e) => setEditStartTime(e.target.value)}
                                />
                                <input
                                    className="input"
                                    type="time"
                                    value={editEndTime}
                                    onChange={(e) => setEditEndTime(e.target.value)}
                                />
                            </div>
                        </>
                    ) : (
                        <div>
                            {formatDatePL(lesson.date)}
                            <br />
                            {lesson.startTime.slice(0, 5)} - {lesson.endTime.slice(0, 5)}
                        </div>
                    )}
                </div>
                {lesson.group.tutor && (
                    <div className="field">
                        <label>Korepetytor</label>
                        <div>{lesson.group.tutor.fullName}</div>
                    </div>
                )}
                {canEdit ? (
                    <div className="field">
                        <label>Notatka</label>
                        <textarea
                            className="input note-textarea"
                            rows={3}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Dodaj notatkę dla kursantów..."
                        />
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm note-save-btn"
                            onClick={handleSaveNote}
                            disabled={saving}
                        >
                            {saving ? "Zapisuję..." : "Zapisz notatkę"}
                        </button>
                    </div>
                ) : lesson.note ? (
                    <div className="field">
                        <label>Notatka</label>
                        <div className="note-text">{lesson.note}</div>
                    </div>
                ) : null}
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
                    {canEdit && editingLesson && (
                        <button
                            className="btn btn-primary"
                            onClick={handleSaveLesson}
                            disabled={saving}
                        >
                            {saving ? "Zapisuję..." : "Zapisz zmiany"}
                        </button>
                    )}
                    {canEdit && !editingLesson && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => setEditingLesson(true)}
                            disabled={saving}
                        >
                            Edytuj termin
                        </button>
                    )}
                    {canEdit && editingLesson && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => setEditingLesson(false)}
                            disabled={saving}
                        >
                            Anuluj edycję
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
