"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { strategies } from "../strategies";
import { PlanBuilder } from "./plan-builder";
import { PlanList } from "./plan-list";
import { StrategyCard, StrategyDetails, StrategyGrid } from "./strategy-card";
import styles from "./investments.module.css";

/** Strategy cards wired to the plan builder: choosing a card preselects it in the form. */
export function StrategyPicker() {
  const [strategyId, setStrategyId] = useState(strategies[0].id);

  function choose(id: string) {
    setStrategyId(id);
    document.getElementById("plan-builder")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <>
      <StrategyGrid>
        {strategies.map((strategy, index) => (
          <StrategyCard key={strategy.id} strategy={strategy} index={index} selected={strategy.id === strategyId}>
            <StrategyDetails strategy={strategy} />
            <Button variant="outline" size="sm" block arrow="arrow-right" onClick={() => choose(strategy.id)} className={styles.selectButton}>
              {strategy.id === strategyId ? "Selected for your plan" : "Automate this strategy"}
            </Button>
          </StrategyCard>
        ))}
      </StrategyGrid>
      <div className={styles.builderGrid}>
        <PlanBuilder strategyId={strategyId} onStrategyChange={setStrategyId} />
        <PlanList />
      </div>
    </>
  );
}
