"use client";

import { cn } from "@/lib/utils";
import styles from "./segmented-control.module.css";

type Option<T extends string> = T | { value: T; label: string };

type Props<T extends string> = {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: "pills" | "tabs";
  className?: string;
};

export function SegmentedControl<T extends string>({ label, options, value, onChange, variant = "pills", className }: Props<T>) {
  return (
    <div role="group" aria-label={label} className={cn(styles[variant], className)}>
      {options.map(option => {
        const item = typeof option === "string" ? { value: option, label: option } : option;
        return (
          <button key={item.value} type="button" aria-pressed={value === item.value} onClick={() => onChange(item.value)}>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
