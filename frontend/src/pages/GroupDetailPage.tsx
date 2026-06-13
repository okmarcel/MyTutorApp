import type { TutoringGroup, Enrollment, ModalState, View } from "../api/types";
import { OccupancyBar } from "../components/OccupancyBar";
import { apiDelete } from "../api/client";
import { useState } from "react";
type Props = {
    group: TutoringGroup;
    enrollments: Enrollment[];
    onOpenModal: (m: ModalState) => void;
    onNavigate: (v: View) => void;
    onRefresh: () => void;
};
export function GroupDetailPage({
                                    group,
                                    enrollments,
                                    onOpenModal,
                                    onNavigate,
                                    onRefresh,
                                }: Props) {
    const [removing, setRemoving] = useState<number | null>(null);
    const activeEnrollments = enrollments.filter(
        (e) => e.group.id === group.id && e.status === "ACTIVE"
    );
    async function handleRemoveStudent(studentId: number) {
        setRemoving(studentId);
        try {
            await apiDelete(`/api/groups/${group.id}/students/${studentId}`);
            onRefresh();
        } catch {
            // silently fail
        } finally {
            setRemoving(null);
        }
    }
    return (
        <>
            <div className="page-header">
                <h1>Uczestnicy grupy</h1>
                <button
                    className="btn btn-secondary"
                    onClick={() => onNavigate("groups")}
                >
                    ← Powrót do grup
                </button>
            </div>
            <div className="group-detail-header">
                <h2>{group.name}</h2>
                <dl className="group-detail-info">
                    <div>
                        <dt>Poziom</dt>
                        <dd>{group.level}</dd>
                    </div>
                    <div>
                        <dt>Temat</dt>
                        <dd>{group.subject}</dd>
                    </div>
                    <div>
                        <dt>Korepetytor</dt>
                        <dd>{group.tutor?.fullName ?? "Brak"}</dd>
                    </div>
                    <div>
                        <dt>Zajętość</dt>
                        <dd>
                            <OccupancyBar
                                current={group.activeEnrollmentCount}
                                capacity={group.capacity}
                            />
                        </dd>
                    </div>
                </dl>
            </div>
            <div className="page-header">
                <h2>Uczestnicy ({activeEnrollments.length})</h2>
                <button
                    className="btn btn-primary"
                    onClick={() =>
                        onOpenModal({ type: "edit-group", group })
                    }
                >
                    Zarządzaj grupą
                </button>
            </div>
            <div className="panel">
                {activeEnrollments.length === 0 && (
                    <div className="empty-state">Brak uczestników w grupie</div>
                )}
                {activeEnrollments.map((e) => (
                    <div className="member-item" key={e.id}>
                        <div>
                            <strong>{e.student.fullName}</strong>
                            <div className="text-sm muted">
                                {e.student.email}
                                {e.student.phoneNumber ? ` · ${e.student.phoneNumber}` : ""}
                            </div>
                        </div>
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemoveStudent(e.student.id)}
                            disabled={removing === e.student.id}
                        >
                            {removing === e.student.id ? "..." : "Usuń"}
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
}
