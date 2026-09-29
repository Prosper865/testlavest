import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./panel.module.css";

export function Panel({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn(styles.panel, className)} {...props} />;
}

export function PanelHeader({ title, action, as: Heading = "h2" }: { title: ReactNode; action?: ReactNode; as?: "h2" | "h3" }) {
  return (
    <div className={styles.panelHeader}>
      <Heading>{title}</Heading>
      {action}
    </div>
  );
}

export function Stat({ label, value, className }: { label: ReactNode; value: ReactNode; className?: string }) {
  return (
    <div className={cn(styles.stat, className)}>
      <small>{label}</small>
      <b>{value}</b>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className={styles.empty}>{children}</div>;
}

export function StatusMessage({ children }: { children: ReactNode }) {
  return <p role="status" className={styles.status}>{children}</p>;
}

/** Labelled form row. Use `group` for controls that label themselves, such as a SegmentedControl. */
export function Field({ label, hint, group = false, children }: { label: string; hint?: ReactNode; group?: boolean; children: ReactNode }) {
  const Wrapper = group ? "div" : "label";
  return (
    <Wrapper className={styles.field}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </Wrapper>
  );
}
