import type { UserRole, View, ModalState, Lesson, User, TutoringGroup } from "../api/types";
type Props = {
    role: UserRole;
    users: User[];
    groups: TutoringGroup[];
    lessons: Lesson[];
    unread: number;
    onNavigate: (view: View) => void;
    onOpenModal: (modal: ModalState) => void;
};
export function DashboardPage({
                                  role,
                                  users,
                                  groups,
                                  lessons,
                                  unread,
                                  onNavigate,
                                  onOpenModal,
                              }: Props) {
    const students = users.filter((u) => u.role === "STUDENT");
    const tutors = users.filter((u) => u.role === "TUTOR");
    const planned = lessons.filter((l) => l.status === "PLANNED");
    const adminCards = [
        { value: students.length, label: "Kursanci" },
        { value: tutors.length, label: "Korepetytorzy" },
        { value: groups.length, label: "Grupy" },
        { value: planned.length, label: "Zajęcia w tym tygodniu" },
    ];
    const tutorCards = [
        { value: groups.length, label: "Moje grupy" },
        { value: planned.length, label: "Zajęcia w tym tygodniu" },
    ];
    const studentCards = [
        { value: planned.length, label: "Nadchodzące zajęcia" },
        { value: groups.length, label: "Moje grupy" },
    ];
    const cards =
        role === "ADMIN" ? adminCards : role === "TUTOR" ? tutorCards : studentCards;
    return (
        <>
            <h1>Panel główny</h1>
            <div
                className="cards-grid"
                style={
                    cards.length < 4
                        ? { gridTemplateColumns: `repeat(${cards.length}, 1fr)` }
                        : undefined
                }
            >
                {cards.map((c) => (
                    <div className="stat-card" key={c.label}>
                        <div className="stat-card-value">{c.value}</div>
                        <div className="stat-card-label">{c.label}</div>
                    </div>
                ))}
            </div>
            <h2 className="section-title">Szybkie akcje</h2>
            {role === "ADMIN" && (
                <div className="actions-grid">
                    <button
                        className="action-btn"
                        onClick={() => onOpenModal({ type: "add-lesson" })}
                    >
                        Dodaj zajęcia
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => onOpenModal({ type: "add-student" })}
                    >
                        Dodaj kursanta
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => onOpenModal({ type: "add-tutor" })}
                    >
                        Dodaj korepetytora
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => onOpenModal({ type: "create-group" })}
                    >
                        Utwórz grupę
                    </button>
                </div>
            )}
            {role === "TUTOR" && (
                <div className="actions-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                    <button
                        className="action-btn"
                        onClick={() => onOpenModal({ type: "add-lesson" })}
                    >
                        Dodaj zajęcia
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => onOpenModal({ type: "add-student" })}
                    >
                        Dodaj kursanta
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => onOpenModal({ type: "create-group" })}
                    >
                        Utwórz grupę
                    </button>
                </div>
            )}
            {role === "STUDENT" && (
                <div className="actions-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                    <button className="action-btn" onClick={() => onNavigate("enroll")}>
                        Zapisz się na zajęcia
                    </button>
                    <button className="action-btn" onClick={() => onNavigate("schedule")}>
                        Przeglądaj harmonogram
                    </button>
                    <button className="action-btn" onClick={() => onNavigate("history")}>
                        Zobacz wszystkie zajęcia
                    </button>
                </div>
            )}
            <h2 className="section-title">Nadchodzące zajęcia</h2>
            <div className="panel">
                {planned.length === 0 && (
                    <div className="empty-state">Brak zaplanowanych zajęć</div>
                )}
                {planned.slice(0, 6).map((l) => (
                    <div
                        className="panel-row"
                        key={l.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => onOpenModal({ type: "lesson-detail", lesson: l })}
                    >
                        <div>
                            <div className="panel-row-title">{l.group.name}</div>
                            <div className="panel-row-info">
                                {l.date} | {l.startTime.slice(0, 5)}-{l.endTime.slice(0, 5)}
                            </div>
                        </div>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onNavigate("schedule");
                            }}
                        >
                            Szczegóły
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
}
