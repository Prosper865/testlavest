"use client";

import { EmptyState, Panel, PanelHeader } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { portfolioActions, usePortfolio } from "@/features/portfolio/store";
import { cn } from "@/lib/utils";
import type { KeyDate } from "../key-dates";
import styles from "./tesla.module.css";
import { Icon } from "@/components/ui";

const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const day = new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "UTC" });

/** Upcoming Tesla events with a "Remind me" toggle that feeds the platform reminder banner. */
export function KeyDatesPanel({ events }: { events: KeyDate[] }) {
  const { reminders } = usePortfolio();

  function toggle(event: KeyDate) {
    const on = !reminders.some(item => item.id === event.id);
    portfolioActions.toggleReminder({ id: event.id, title: event.title, date: event.date });
    if (on) toast("Reminder set", `We'll show "${event.title}" at the top of the platform in the days before it happens.`);
  }

  return (
    <Panel aria-label="Tesla key dates">
      <PanelHeader title="Key dates" />
      {events.length === 0 ? (
        <EmptyState>No upcoming events found.</EmptyState>
      ) : (
        <ul className={styles.events}>
          {events.map(event => {
            const reminded = reminders.some(item => item.id === event.id);
            return (
              <li key={event.id} className={styles.event}>
                <div className={styles.day} aria-hidden="true"><small>{month.format(event.date)}</small><b>{day.format(event.date)}</b></div>
                <div>
                  <h3>{event.title}<span className={cn(styles.status, event.status === "Expected" && styles.expected)}>{event.status}</span></h3>
                  <p>{event.detail}</p>
                </div>
                <button type="button" className={styles.remind} aria-pressed={reminded} aria-label={`${reminded ? "Remove reminder for" : "Remind me about"} ${event.title}`} onClick={() => toggle(event)}>
                  {reminded ? <><Icon name="check" /> Reminder on</> : <><Icon name="bell" /> Remind me</>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className={styles.source}>&ldquo;Expected&rdquo; dates follow Tesla&apos;s usual timing; confirm on Tesla&apos;s investor relations site. &ldquo;Scheduled&rdquo; dates come from the earnings calendar.</p>
    </Panel>
  );
}
