import pageStyles from "@/pages/simplePage.module.css";
import styles from "@/pages/schedule.module.css";
import { useI18n } from "@/i18n/i18n";
import { useApiGet } from "@/api/hooks";
import type { LessonRow } from "@/api/types";

type CalendarEvent = {
  id: string;
  day: string;
  startMinutes: number;
  endMinutes: number;
  group: string;
  tutor: string;
  room: string;
  subject: string;
  status: string;
};

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map((p) => Number(p));
  return h * 60 + m;
}

function parseTimeRange(range: string) {
  const match = range.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
  if (!match) return null;
  return { startMinutes: toMinutes(match[1]), endMinutes: toMinutes(match[2]) };
}

function formatMinutes(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function SchedulePage() {
  const { t } = useI18n();
  const { data, loading, error } = useApiGet<LessonRow[]>("/api/schedule/week");
  const days = [
    { id: "Mon", labelKey: "day.mon" },
    { id: "Tue", labelKey: "day.tue" },
    { id: "Wed", labelKey: "day.wed" },
    { id: "Thu", labelKey: "day.thu" },
    { id: "Fri", labelKey: "day.fri" }
  ] as const;

  const lessons = data ?? [];

  const weekdayId = (iso: string) => {
    const d = new Date(iso);
    const n = d.getDay(); // 0 Sun .. 6 Sat
    if (n === 1) return "Mon";
    if (n === 2) return "Tue";
    if (n === 3) return "Wed";
    if (n === 4) return "Thu";
    if (n === 5) return "Fri";
    if (n === 6) return "Sat";
    return "Sun";
  };

  const toEvent = (l: LessonRow): CalendarEvent => {
    const start = new Date(l.startAt);
    const end = new Date(l.endAt);
    return {
      id: String(l.id),
      day: weekdayId(l.startAt),
      startMinutes: start.getHours() * 60 + start.getMinutes(),
      endMinutes: end.getHours() * 60 + end.getMinutes(),
      group: l.groupName,
      tutor: l.tutorName,
      room: l.room,
      subject: l.subject,
      status: l.status
    };
  };

  const events: CalendarEvent[] = lessons.map(toEvent).filter((e) => e.day !== "Sat" && e.day !== "Sun");

  const defaultStart = 14 * 60;
  const defaultEnd = 20 * 60;
  const minStart = Math.min(defaultStart, ...events.map((e) => e.startMinutes));
  const maxEnd = Math.max(defaultEnd, ...events.map((e) => e.endMinutes));
  const dayStart = Math.floor(minStart / 60) * 60;
  const dayEnd = Math.ceil(maxEnd / 60) * 60;
  const hourMarks: number[] = [];
  for (let m = dayStart; m <= dayEnd; m += 60) hourMarks.push(m);
  const totalMinutes = Math.max(1, dayEnd - dayStart);

  const errorText =
    error instanceof Error ? error.message : error ? "Failed to load" : null;

  return (
    <div className={pageStyles.wrap}>
      <div className={pageStyles.toolbar}>
        <button className={pageStyles.primaryButton} type="button">
          {t("schedule.actions.add_lesson")}
        </button>
        <button className={pageStyles.ghostButton} type="button">
          {t("schedule.actions.export")}
        </button>
      </div>

      <div className={pageStyles.card}>
        <div className={styles.calendar}>
          <div className={styles.calendarHead}>
            <div className={styles.timeColHead}>{t("schedule.calendar.time")}</div>
            {days.map((d) => (
              <div key={d.id} className={styles.dayHead}>
                {t(d.labelKey)}
              </div>
            ))}
          </div>

          <div className={styles.calendarBody}>
            <div className={styles.timeCol} aria-hidden="true">
              {hourMarks.map((m) => (
                <div key={m} className={styles.timeMark}>
                  <span className={styles.timeLabel}>{formatMinutes(m)}</span>
                </div>
              ))}
            </div>

            {days.map((day) => {
              const dayEvents = events.filter((e) => e.day === day.id);
              return (
                <div key={day.id} className={styles.dayCol}>
                  <div className={styles.gridLines} aria-hidden="true">
                    {hourMarks.map((m) => (
                      <div key={m} className={styles.gridLine} />
                    ))}
                  </div>

                  {dayEvents.map((e) => {
                    const topPct = ((e.startMinutes - dayStart) / totalMinutes) * 100;
                    const heightPct =
                      ((Math.max(e.endMinutes, e.startMinutes + 15) - e.startMinutes) /
                        totalMinutes) *
                      100;
                    return (
                      <div
                        key={e.id}
                        className={styles.event}
                        style={{
                          top: `${topPct}%`,
                          height: `${heightPct}%`
                        }}
                      >
                        <div className={styles.eventTitle}>{e.group}</div>
                        <div className={styles.eventMeta}>
                          <span>{e.tutor}</span>
                          <span className={styles.dot} aria-hidden="true">
                            •
                          </span>
                          <span className={styles.mono}>{e.room}</span>
                        </div>
                        <div className={styles.eventTime}>
                          <span className={styles.mono}>
                            {formatMinutes(e.startMinutes)}–{formatMinutes(e.endMinutes)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        {!loading && events.length === 0 ? (
          <div style={{ marginTop: 12, color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
            {errorText ?? "—"}
          </div>
        ) : null}
      </div>
    </div>
  );
}
