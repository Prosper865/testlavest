"use client";

import { useSyncExternalStore } from "react";
import styles from "./toast.module.css";

type Toast = { id: number; title: string; body?: string };

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(listener => listener());

export function dismissToast(id: number) {
  toasts = toasts.filter(item => item.id !== id);
  emit();
}

/** Shows a short-lived notification in the corner of the screen. */
export function toast(title: string, body?: string, durationMs = 7000) {
  const id = nextId++;
  toasts = [...toasts, { id, title, body }].slice(-4);
  emit();
  window.setTimeout(() => dismissToast(id), durationMs);
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const empty: Toast[] = [];

export function Toaster() {
  const items = useSyncExternalStore(subscribe, () => toasts, () => empty);
  return (
    <div className={styles.region} role="status" aria-live="polite">
      {items.map(item => (
        <div key={item.id} className={styles.toast}>
          <span className={styles.dot} aria-hidden="true" />
          <div>
            <b>{item.title}</b>
            {item.body && <p>{item.body}</p>}
          </div>
          <button type="button" aria-label="Dismiss notification" onClick={() => dismissToast(item.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
