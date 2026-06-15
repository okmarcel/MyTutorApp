type OccupancyBarProps = {
    current: number;
    capacity: number;
};
export function OccupancyBar({ current, capacity }: OccupancyBarProps) {
    const pct = capacity > 0 ? Math.min((current / capacity) * 100, 100) : 0;
    const level = pct < 50 ? "level-low" : pct < 80 ? "level-mid" : "level-high";
    return (
        <div className="occupancy" title="Liczba uczestników zapisanych do grupy">
            <span className="occupancy-label">Uczestnicy</span>
            <div className="occupancy-track">
                <div
                    className={`occupancy-fill ${level}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="occupancy-text">
        {current} / {capacity}
      </span>
        </div>
    );
}
