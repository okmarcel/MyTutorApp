import { useState } from "react";
import type { Lesson, ModalState, UserRole } from "../api/types";
import { formatDatePL } from "../api/format";
type Props = {
    lessons: Lesson[];
    role: UserRole;
    onOpenModal: (m: ModalState) => void;
};
export function SchedulePage({ lessons, role, onOpenModal }: Props) {
    const [weekOffset, setWeekOffset] = useState(0);
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const dayNames = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek"];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + weekOffset * 7);
    const weekDates = dayNames.map((_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
    function formatDate(d: Date): string {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }
    const planned = lessons.filter((l) => l.status !== "CANCELLED");
    return (
        <>
            <div className="page-header">
                <h1>Harmonogram</h1>
                <div className="week-nav">
                    <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset((w) => w - 1)}>◀</button>
                    <span className="week-nav-label">
                        {formatDatePL(formatDate(weekDates[0]))} – {formatDatePL(formatDate(weekDates[4]))}
                    </span>
                    <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset((w) => w + 1)}>▶</button>
                </div>
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

                    <div className="cal-header">Godzina</div>
                    {weekDates.map((d, i) => (
                        <div className="cal-header" key={i}>
                            {dayNames[i]}
                            <span className="cal-date">{formatDatePL(formatDate(d))}</span>
                        </div>
                    ))}

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
                                        {cellLessons.map((l) => {
                                            const startMin = Number(l.startTime.slice(3, 5));
                                            const endH = Number(l.endTime.slice(0, 2));
                                            const endMin = Number(l.endTime.slice(3, 5));
                                            const durationMin = (endH - h) * 60 + endMin - startMin;
                                            return (
                                                <div
                                                    className="cal-event"
                                                    key={l.id}
                                                    style={{
                                                        top: `${startMin + 2}px`,
                                                        height: `${durationMin - 4}px`,
                                                    }}
                                                    onClick={() =>
                                                        onOpenModal({ type: "lesson-detail", lesson: l })
                                                    }
                                                >
                                                    <b>{l.group.name}</b>
                                                    <br />
                                                    {l.startTime.slice(0, 5)}-{l.endTime.slice(0, 5)}
                                                </div>
                                            );
                                        })}
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
