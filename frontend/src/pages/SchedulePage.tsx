import type { Lesson, ModalState, UserRole } from "../api/types";
type Props = {
    lessons: Lesson[];
    role: UserRole;
    onOpenModal: (m: ModalState) => void;
};
export function SchedulePage({ lessons, role, onOpenModal }: Props) {
    const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
    const dayNames = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek"];
    // Get the current week's dates (Mon-Fri)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    const weekDates = dayNames.map((_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
    function formatDate(d: Date): string {
        return d.toISOString().slice(0, 10);
    }
    const planned = lessons.filter((l) => l.status !== "CANCELLED");
    return (
        <>
            <div className="page-header">
                <h1>Harmonogram</h1>
                {role !== "STUDENT" && (
                    <button
                        className="btn btn-primary"
                        onClick={() => onOpenModal({ type: "add-lesson" })}
                    >
                        + Dodaj zajęcia
                    </button>
                )}
            </div>
            <div className="calendar-wrap">
                <div className="calendar">
                    {/* Header row */}
                    <div className="cal-header">Godzina</div>
                    {weekDates.map((d, i) => (
                        <div className="cal-header" key={i}>
                            {dayNames[i]}
                            <span className="cal-date">{formatDate(d)}</span>
                        </div>
                    ))}
                    {/* Time grid */}
                    {hours.map((h) => (
                        <>
                            <div className="cal-time" key={`t-${h}`}>
                                {h}:00
                            </div>
                            {weekDates.map((d, di) => {
                                const dateStr = formatDate(d);
                                const cellLessons = planned.filter(
                                    (l) =>
                                        l.date === dateStr &&
                                        Number(l.startTime.slice(0, 2)) === h
                                );
                                return (
                                    <div className="cal-cell" key={`${h}-${di}`}>
                                        {cellLessons.map((l) => (
                                            <div
                                                className="cal-event"
                                                key={l.id}
                                                onClick={() =>
                                                    onOpenModal({ type: "lesson-detail", lesson: l })
                                                }
                                            >
                                                <b>{l.group.name}</b>
                                                <br />
                                                {l.startTime.slice(0, 5)}-{l.endTime.slice(0, 5)}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </>
                    ))}
                </div>
            </div>
        </>
    );
}
