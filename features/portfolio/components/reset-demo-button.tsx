"use client";

import { portfolioActions } from "../store";
import styles from "./portfolio.module.css";

export function ResetDemoButton() {
  function reset() {
    if (window.confirm("Reset your watchlist, alerts, and reminders? Your balance and holdings will be kept.")) portfolioActions.reset();
  }
  return <button type="button" className={styles.resetButton} onClick={reset}>Reset preferences</button>;
}
