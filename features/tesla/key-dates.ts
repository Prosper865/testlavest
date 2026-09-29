import type { TeslaData } from "./get-tesla-data";

export type KeyDate = {
  id: string;
  title: string;
  date: number;
  /** "Scheduled" comes from the earnings calendar; "Expected" is based on Tesla's usual timing. */
  status: "Scheduled" | "Expected";
  detail: string;
};

const QUARTER_STARTS = [0, 3, 6, 9]; // January, April, July, October

/** Upcoming delivery reports (typically the 2nd day of each quarter) and scheduled earnings. */
export function buildKeyDates(data: TeslaData, count = 4, now = Date.now()): KeyDate[] {
  const events: KeyDate[] = [];
  const year = new Date(now).getUTCFullYear();

  for (const y of [year, year + 1]) {
    for (const month of QUARTER_STARTS) {
      const date = Date.UTC(y, month, 2, 13);
      const quarter = month === 0 ? 4 : month / 3;
      const reportYear = month === 0 ? y - 1 : y;
      events.push({
        id: `tsla-deliveries-${reportYear}-q${quarter}`,
        title: `Q${quarter} ${reportYear} deliveries report`,
        date,
        status: "Expected",
        detail: "Production and delivery numbers for the quarter, usually published in the first days after it ends.",
      });
    }
  }

  for (const item of data.earnings) {
    const timing = item.hour === "amc" ? "after the market closes" : item.hour === "bmo" ? "before the market opens" : "time to be confirmed";
    const estimate = item.epsEstimate !== null ? ` Analysts' average estimate: $${item.epsEstimate.toFixed(2)} earnings per share.` : "";
    events.push({
      id: `tsla-earnings-${item.year}-q${item.quarter}`,
      title: `Q${item.quarter} ${item.year} earnings`,
      date: Date.parse(`${item.date}T20:00:00Z`),
      status: "Scheduled",
      detail: `Quarterly results and outlook, ${timing}.${estimate}`,
    });
  }

  return events.filter(event => event.date >= now - 86_400_000).sort((a, b) => a.date - b.date).slice(0, count);
}
