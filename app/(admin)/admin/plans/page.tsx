import type { Metadata } from "next";
import Link from "next/link";
import { Card, Empty, PageHeader, Pill } from "@/features/admin";
import styles from "@/features/admin/components/admin.module.css";
import { listAllPlans, PlanCard, PlanRowActions, riskLabels } from "@/features/plans";
import planStyles from "@/features/plans/components/plan-admin.module.css";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui";

export const metadata: Metadata = { title: "Investment plans" };

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default async function AdminPlansPage({ searchParams }: PageProps<"/admin/plans">) {
  const [plans, params] = await Promise.all([listAllPlans(), searchParams]);
  const visible = plans.filter(plan => plan.visible);

  return (
    <>
      <PageHeader
        title="Investment plans"
        description="The plan cards on the public website. Changes appear on the site immediately."
        actions={<Link href="/admin/plans/new" className={planStyles.newButton}>+ New plan</Link>}
      />
      {params.saved && <p className={planStyles.saved} role="status">Plan saved and published.</p>}

      <div className={styles.grid}>
        <Card title={`All plans (${plans.length})`} bodyless>
          {plans.length === 0 ? <Empty title="No plans yet">Create your first plan to show it on the website.</Empty> : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Plan</th><th className={styles.hideSm}>Min – Max</th><th className={styles.hideSm}>Risk</th><th className={styles.hideSm}>Est. return</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
                <tbody>
                  {plans.map((plan, index) => (
                    <tr key={plan.id}>
                      <td>
                        <b>{plan.name}</b> {plan.featured && <Pill status="featured" />}
                        <div className={styles.muted}>{plan.visible ? "Shown on website" : "Hidden"}</div>
                      </td>
                      <td className={cn(styles.muted, styles.hideSm)}>{usd.format(plan.minInvestment)} – {plan.maxInvestment === null ? "no max" : usd.format(plan.maxInvestment)}</td>
                      <td className={cn(styles.muted, styles.hideSm)}>{riskLabels[plan.riskLevel]}</td>
                      <td className={cn(styles.muted, styles.hideSm)}>{plan.expectedReturn}</td>
                      <td><PlanRowActions id={plan.id} name={plan.name} visible={plan.visible} isFirst={index === 0} isLast={index === plans.length - 1} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Website preview" action={<Link href="/#plans" target="_blank">Open website <Icon name="arrow-up-right" /></Link>}>
          {visible.length === 0 ? <Empty title="Nothing is shown">Turn on at least one plan to show the section&apos;s cards.</Empty> : (
            <div className={planStyles.previewGrid}>
              {visible.map((plan, index) => <PlanCard key={plan.id} plan={plan} index={index} />)}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
