import { useState, FormEvent } from "react";
import { apiPost } from "../../api/client";
import type { TutoringGroup, LessonRequest } from "../../api/types";
type Props = {
    groups: TutoringGroup[];
    onClose: () => void;
    onDone: () => void;
};
export function AddLessonModal({ groups, onClose, onDone }: Props) {
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        const fd = new FormData(e.currentTarget);
        const body: LessonRequest = {
            groupId: Number(fd.get("groupId")),
            date: fd.get("date") as string,
            startTime: fd.get("startTime") as string,
            endTime: fd.get("endTime") as string,
        };
        if (!body.groupId || !body.date || !body.startTime || !body.endTime) {
            setError("Wypełnij wszystkie pola");
            return;
        }
        setSaving(true);
        try {
            await apiPost("/api/lessons", body);
            onDone();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Nie udało się dodać zajęć");
        } finally {
            setSaving(false);
        }
    }
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <form
                className="modal"
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="modal-title">Dodaj zajęcia</h2>
                {error && <div className="modal-error">{error}</div>}
                <div className="field">
                    <label>Grupa</label>
                    <select className="input select-input" name="groupId" required>
                        <option value="">Wybierz grupę</option>
                        {groups.map((g) => (
                            <option value={g.id} key={g.id}>
                                {g.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="field">
                    <label>Data</label>
                    <input className="input" type="date" name="date" required />
                </div>
                <div className="two-col">
                    <div className="field">
                        <label>Godzina rozpoczęcia</label>
                        <input className="input" type="time" name="startTime" required />
                    </div>
                    <div className="field">
                        <label>Godzina zakończenia</label>
                        <input className="input" type="time" name="endTime" required />
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Anuluj
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Zapisuję..." : "Dodaj zajęcia"}
                    </button>
                </div>
            </form>
        </div>
    );
}
