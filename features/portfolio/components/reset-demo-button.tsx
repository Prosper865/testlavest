"use client";

import { portfolioActions } from "../store";
import styles from "./portfolio.module.css";

export function ResetDemoButton() {
  function reset() {
    if (window.confirm("Reset the demo account to its starting balances? Your demo activity will be cleared.")) portfolioActions.reset();
  }
  return <button type="button" className={styles.resetButton} onClick={reset}>Reset demo account</button>;
}
