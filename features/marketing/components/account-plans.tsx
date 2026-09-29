"use client";

import Link from "next/link";
import { useState } from "react";
import { ButtonLink, Eyebrow } from "@/components/ui";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import { accountPlans as plans } from "../content";
import styles from "./account-plans.module.css";

function PlanIcon({ kind }: { kind: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === "start" ? <><path d="M7 25V15h6v10M19 25V7h6v18M4 25h24" /><path d="m7 9 6-5 5 4 7-5" /></>
        : kind === "chart" ? <><path d="M5 5v22h23M9 20l6-7 5 3 7-10" /><path d="M21 6h6v6" /></>
        : <><path d="m5 11 5-6h12l5 6-11 16L5 11Z" /><path d="M5 11h22M10 5l6 22 6-22" /></>}
    </svg>
  );
}

export function AccountPlans() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedPlan = plans.find(plan => plan.id === selected);

  return (
    <section className={styles.section} id="plans" aria-labelledby="plans-heading">
      <div className="shell">
        <div className={styles.heading}>
          <Eyebrow dot>Account plans</Eyebrow>
          <h2 id="plans-heading">Your market. Your pace.<br /><span>An account to match.</span></h2>
          <p>Start with the essentials or explore a more advanced experience.<br />Find the account that fits the way you want to invest.</p>
          <span className={styles.previewLabel}>PROPOSED ACCOUNT TIERS · LAUNCH DETAILS TO FOLLOW</span>
        </div>
        <div className={styles.grid}>
          {plans.map(plan => {
            const isSelected = selected === plan.id;
            return (
              <article key={plan.id} className={cn(styles.card, plan.id === "active" && styles.featured, isSelected && styles.selected)}>
                <div className={styles.cardTop}>
                  <span className={styles.icon}><PlanIcon kind={plan.icon} /></span>
                  <span className={styles.position}>{plan.id === "active" ? "FOR ACTIVE TRADERS" : `${site.wordmark} / ${plan.number}`}</span>
                </div>
                <div className={styles.label}>{plan.label}</div>
                <h3>{plan.name}</h3>
                <p className={styles.description}>{plan.description}</p>
                <div className={styles.pricing}>
                  <span>Account pricing</span>
                  <strong>Coming soon<span>↗</span></strong>
                  <small>Fees and minimum deposit to be confirmed</small>
                </div>
                <button type="button" className={styles.button} aria-expanded={isSelected} aria-controls="plan-details" onClick={() => setSelected(value => value === plan.id ? null : plan.id)}>
                  {isSelected ? "Hide account details" : `Explore ${plan.name}`}<span aria-hidden="true">↗</span>
                </button>
                <div className={styles.includes}>PLANNED ACCOUNT FEATURES</div>
                <ul>{plan.features.map(feature => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}</ul>
                <div className={styles.audience}><span>Designed for</span><b>{plan.audience}</b></div>
              </article>
            );
          })}
        </div>
        <div id="plan-details" className={styles.details} hidden={!selectedPlan} aria-live="polite">
          {selectedPlan && (
            <>
              <div>
                <Eyebrow>{selectedPlan.name} · account preview</Eyebrow>
                <h3>A closer look at {selectedPlan.name}.</h3>
                <p>{selectedPlan.detail} These tiers are proposed; premium tools and service levels are not yet available. You can explore the shared demo platform today.</p>
              </div>
              <ButtonLink href="/dashboard">Try the platform demo</ButtonLink>
            </>
          )}
        </div>
        <div className={styles.footnote}>
          <span className={styles.footnoteIcon} aria-hidden="true">i</span>
          <p>Compare account experiences, not investment returns. Features shown are planned. Final fees, minimum deposits, and country eligibility will be published before real accounts become available.</p>
          <Link href="/dashboard">Explore the demo <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  );
}
