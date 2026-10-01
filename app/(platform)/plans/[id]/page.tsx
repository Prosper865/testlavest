import Link from "next/link";
import { and, eq, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";
import { getDb, schema } from "@/lib/db";
import { CheckoutForm } from "@/features/payments/checkout-form";
import { money } from "@/lib/format";
import styles from "@/features/payments/checkout.module.css";

export const metadata = { title: "Start a plan" };

export default async function PlanCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/plans/${id}`);
  const db = await getDb();
  const plan = await db.query.investmentPlans.findFirst({ where: and(eq(schema.investmentPlans.id, id), eq(schema.investmentPlans.visible, true)) });
  if (!plan) notFound();
  const [methods, pending] = await Promise.all([
    db.select({ id: schema.paymentMethods.id, name: schema.paymentMethods.name, network: schema.paymentMethods.network, address: schema.paymentMethods.address })
      .from(schema.paymentMethods).where(ne(schema.paymentMethods.address, "")),
    db.select({ id: schema.planPayments.id }).from(schema.planPayments).where(and(eq(schema.planPayments.userId, user.id), eq(schema.planPayments.planId, id), eq(schema.planPayments.status, "pending"))),
  ]);
  return <div className={styles.stack}>
    <Link href="/plans">← All plans and payment status</Link>
    <div><span className={styles.badge}>PLAN</span><h1>Start with {plan.name}</h1><p>{plan.tagline}</p></div>
    <div className={styles.card}><h2>{plan.name}</h2><p>From {money(plan.minInvestment)} · {plan.duration}</p>
      {pending.length ? <p className={styles.notice}>Your payment for this plan is already under review. <Link href="/plans">View your submission</Link>.</p> :
        <CheckoutForm plan={{ id: plan.id, name: plan.name, minInvestment: plan.minInvestment, maxInvestment: plan.maxInvestment }} methods={methods} submissionId={crypto.randomUUID()} />}
    </div>
  </div>;
}
