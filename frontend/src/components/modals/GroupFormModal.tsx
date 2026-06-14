import { useState } from "react";
import { apiPost, apiPut, apiDelete } from "../../api/client";
import type {
    TutoringGroup,
    User,
    GroupRequest,
    UserRole,
} from "../../api/types";

type Props = {
    mode: "create" | "edit";
    group?: TutoringGroup;
    tutors: User[];
    students: User[];
    enrolledStudentIds: number[];
    currentRole: UserRole;
    currentUserId: number;
    onClose: () => void;
    onDone: () => void;
};

const groupLevels = ["Podstawowy", "Średniozaawansowany", "Zaawansowany"];

export function GroupFormModal({
                                   mode,
                                   group,
                                   tutors,
                                   students,
                                   enrolledStudentIds,
                                   currentRole,
                                   currentUserId,
                                   onClose,
                                   onDone,
                               }: Props) {
    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<Set<number>>(
        new Set(enrolledStudentIds)
    );

    const [name, setName] = useState(group?.name ?? "");
    const [level, setLevel] = useState(group?.level ?? "");
    const [subject, setSubject] = useState(group?.subject ?? "");
    const [capacity, setCapacity] = useState(group?.capacity ?? 10);
    const [tutorId, setTutorId] = useState<string>(
        group?.tutor?.id?.toString() ??
        (currentRole === "TUTOR" ? currentUserId.toString() : "")
    );

    const title = mode === "create" ? "Utwórz grupę" : "Edytuj grupę";
    const canManageTutor = currentRole === "ADMIN";

    function toggleStudent(id: number) {
        setSelectedStudents((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    async function handleSave() {
        setError("");
        if (!name || !level || !subject) {
            setError("Wypełnij wszystkie wymagane pola");
            return;
        }

        setSaving(true);
        try {
            const body: GroupRequest = {
                name,
                level,
                subject,
                capacity,
                tutorId: null,
            };

            let groupId: number;
            if (mode === "create") {
                const created = await apiPost<TutoringGroup>("/api/groups", {
                    ...body,
                    tutorId: currentRole === "TUTOR" ? currentUserId : body.tutorId,
                });
                groupId = created.id;
            } else {
                await apiPut<TutoringGroup>(`/api/groups/${group!.id}`, body);
                groupId = group!.id;
            }

            const prevTutorId = group?.tutor?.id?.toString() ?? "";
            const newTutorId = tutorId;
            if (canManageTutor && newTutorId !== prevTutorId) {
                if (newTutorId) {
                    await apiPut(`/api/groups/${groupId}/tutor/${newTutorId}`);
                } else if (prevTutorId) {
                    await apiDelete(`/api/groups/${groupId}/tutor`);
                }
            }

            const previously = new Set(enrolledStudentIds);
            const toAdd = [...selectedStudents].filter((id) => !previously.has(id));
            const toRemove = [...previously].filter((id) => !selectedStudents.has(id));
            await Promise.all([
                ...toAdd.map((sid) =>
                    apiPost(`/api/groups/${groupId}/students/${sid}`)
                ),
                ...toRemove.map((sid) =>
                    apiDelete(`/api/groups/${groupId}/students/${sid}`)
                ),
            ]);
            onDone();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Nie udało się zapisać");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }

        setSaving(true);
        try {
            await apiDelete(`/api/groups/${group!.id}`);
            onDone();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Nie udało się usunąć");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">{title}</h2>
                <div className="step-dots">
                    <div className={`step-dot ${step >= 1 ? "active" : ""}`} />
                    <div className={`step-dot ${step >= 2 ? "active" : ""}`} />
                </div>
                {error && <div className="modal-error">{error}</div>}
                {step === 1 ? (
                    <>
                        <div className="field">
                            <label>Nazwa grupy</label>
                            <input
                                className="input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="np. Matematyka - poziom podstawowy"
                                required
                            />
                        </div>
                        <div className="field">
                            <label>Temat</label>
                            <input
                                className="input"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="np. Matematyka, Fizyka lub Angielski"
                                required
                            />
                        </div>
                        <div className="field">
                            <label>Poziom</label>
                            <select
                                className="input select-input"
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                required
                            >
                                <option value="">Wybierz poziom</option>
                                {groupLevels.map((groupLevel) => (
                                    <option value={groupLevel} key={groupLevel}>
                                        {groupLevel}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label>Liczba miejsc</label>
                            <input
                                className="input"
                                type="number"
                                min={1}
                                value={capacity}
                                onChange={(e) => setCapacity(Number(e.target.value))}
                                required
                            />
                        </div>
                        {canManageTutor && tutors.length > 0 && (
                            <div className="field">
                                <label>Korepetytor</label>
                                <select
                                    className="input select-input"
                                    value={tutorId}
                                    onChange={(e) => setTutorId(e.target.value)}
                                >
                                    <option value="">Wybierz korepetytora</option>
                                    {tutors.map((t) => (
                                        <option value={t.id} key={t.id}>
                                            {t.fullName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="modal-footer">
                            {mode === "edit" && (
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                    disabled={saving}
                                >
                                    {confirmDelete ? "Na pewno?" : "Usuń grupę"}
                                </button>
                            )}
                            <div className="modal-footer-right" style={{ marginLeft: "auto" }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => setStep(2)}
                                >
                                    Dalej
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 className="mb-4">Przypisz kursantów</h3>
                        <div className="checkbox-list">
                            {students.length === 0 && (
                                <div className="empty-state">Brak kursantów w systemie</div>
                            )}
                            {students.map((s) => (
                                <label className="checkbox-item" key={s.id}>
                                    <input
                                        type="checkbox"
                                        checked={selectedStudents.has(s.id)}
                                        onChange={() => toggleStudent(s.id)}
                                    />
                                    <span>{s.fullName}</span>
                                </label>
                            ))}
                        </div>
                        <div className="modal-footer">
                            {mode === "edit" && (
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                    disabled={saving}
                                >
                                    {confirmDelete ? "Na pewno?" : "Usuń grupę"}
                                </button>
                            )}
                            <div className="modal-footer-right" style={{ marginLeft: "auto" }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setStep(1)}
                                >
                                    Cofnij
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? "Zapisuję..." : title}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
