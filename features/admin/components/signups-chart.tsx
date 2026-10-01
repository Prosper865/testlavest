import styles from "./admin.module.css";

const weekday = new Intl.DateTimeFormat("en-US", { weekday: "narrow" });

/** Sign-ups per day for the last two weeks. Today's bar is highlighted. */
export function SignupsChart({ days }: { days: { date: number; count: number }[] }) {
  const max = Math.max(1, ...days.map(day => day.count));
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const lastWeek = days.slice(-7).reduce((sum, day) => sum + day.count, 0);
  const label = days.map(day => `${new Date(day.date).toDateString()}: ${day.count}`).join(", ");
  return (
    <>
      <div className={styles.bars} role="img" aria-label={`Sign-ups per day for the last 14 days. ${label}`}>
        {days.map((day, index) => (
          <div key={day.date} className={styles.bar} title={`${new Date(day.date).toDateString()}: ${day.count} sign-up${day.count === 1 ? "" : "s"}`}>
            <i className={index === days.length - 1 ? styles.today : undefined} style={{ height: `${Math.max(3, (day.count / max) * 100)}%` }} />
            <small aria-hidden="true">{weekday.format(day.date)}</small>
          </div>
        ))}
      </div>
      <div className={styles.chartMeta}>
        <div><b>{total}</b>Last 14 days</div>
        <div><b>{lastWeek}</b>Last 7 days</div>
      </div>
    </>
  );
}
