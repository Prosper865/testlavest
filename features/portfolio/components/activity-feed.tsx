"use client";

import { EmptyState, Panel, PanelHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { usePortfolio, type Module } from "../store";
import styles from "./portfolio.module.css";

type Props = { title?: string; modules?: Module[]; limit?: number };

export function ActivityFeed({ title = "Recent activity", modules, limit = 8 }: Props) {
  const { activity } = usePortfolio();
  const items = activity.filter(item => !modules || modules.includes(item.module)).slice(0, limit);
  return (
    <Panel aria-label={title}>
      <PanelHeader title={title} />
      {items.length === 0 ? (
        <EmptyState>No activity yet. Actions you take in the demo will appear here.</EmptyState>
      ) : (
        <ul className={styles.activity}>
          {items.map(item => (
            <li key={item.id}>
              <time dateTime={new Date(item.time).toISOString()}>{formatDateTime(item.time)}</time>
              <div><span className={styles.module}>{item.module}</span><div>{item.text}</div></div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
