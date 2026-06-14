export function formatDatePL(isoDate: string): string {
    if (!isoDate || isoDate.length < 10) return isoDate;
    const [y, m, d] = isoDate.split("-");
    return `${d}.${m}.${y}`;
}
