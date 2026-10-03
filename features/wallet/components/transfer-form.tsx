"use client";

import { ButtonLink, Eyebrow, Panel } from "@/components/ui";
import styles from "./wallet.module.css";

// Sending crypto out of the wallet is closed along with crypto trading, so this only offers deposits.
export function TransferForm() {
  return <Panel className={styles.form} aria-label="Add funds">
    <Eyebrow>Add funds</Eyebrow><h2>Deposit by wallet or bank.</h2>
    <p>Pay with a crypto wallet or a bank transfer, then upload your proof of payment for review.</p>
    <ButtonLink href="/deposits">Add funds</ButtonLink>
  </Panel>;
}
