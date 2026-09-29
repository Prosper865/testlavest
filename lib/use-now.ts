"use client";

import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

function subscribe(listener: () => void) {
  const timer = window.setInterval(listener, MINUTE);
  return () => window.clearInterval(timer);
}

/** Current time rounded to the minute, updated every minute. Returns 0 during server rendering. */
export function useNow() {
  return useSyncExternalStore(subscribe, () => Math.floor(Date.now() / MINUTE) * MINUTE, () => 0);
}
