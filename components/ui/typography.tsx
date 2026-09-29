import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./typography.module.css";

export function Eyebrow({ children, dot = false, className }: { children: ReactNode; dot?: boolean; className?: string }) {
  return (
    <div className={cn(styles.eyebrow, className)}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </div>
  );
}

type SectionHeadingProps = {
  eyebrow: ReactNode;
  title: ReactNode;
  aside?: ReactNode;
  level?: "h1" | "h2";
  id?: string;
  className?: string;
};

export function SectionHeading({ eyebrow, title, aside, level = "h2", id, className }: SectionHeadingProps) {
  const Heading = level;
  return (
    <div className={cn(styles.sectionHeading, className)}>
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Heading id={id}>{title}</Heading>
      </div>
      {typeof aside === "string" ? <p className={styles.aside}>{aside}</p> : aside && <div className={styles.aside}>{aside}</div>}
    </div>
  );
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn(styles.tag, className)}>{children}</span>;
}
