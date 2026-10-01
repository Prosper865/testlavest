"use client";

import Link from "next/link";
import { usePortfolio } from "@/features/portfolio/store";
import { formatDate } from "@/lib/format";
import { useNow } from "@/lib/use-now";
import styles from "./alerts.module.css";
import { Icon } from "@/components/ui";

const DAY = 86_400_000;

/** Shows reminded events happening within the next three days. */
export function ReminderBanner() {
  const { reminders } = usePortfolio();
  const now = useNow();
  if (!now) return null;
  const upcoming = reminders.filter(item => item.date >= now - DAY && item.date <= now + 3 * DAY).sort((a, b) => a.date - b.date);
  if (upcoming.length === 0) return null;

  return (
    <aside className={styles.banner} aria-label="Upcoming reminders">
      <b>Coming up</b>
      {upcoming.map(item => (
        <span key={item.id}><strong>{item.title}</strong> · {formatDate(item.date)}</span>
      ))}
      <Link href="/tesla#key-dates" className="accent-text">View calendar <Icon name="arrow-right" /></Link>
    </aside>
  );
}
