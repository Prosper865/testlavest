import Image from "next/image";
import { SectionHeading } from "@/components/ui";
import { compliance, site } from "@/config/site";
import { cn } from "@/lib/utils";
import { accountOpportunities, advantages } from "../content";
import styles from "./why-us.module.css";

type IconKind = (typeof advantages)[number]["icon"];

function AdvantageIcon({ kind }: { kind: IconKind }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === "expert" && <><circle cx="12" cy="8" r="4" /><path d="M5 21v-1a7 7 0 0 1 14 0v1" /><path d="m15.5 14.5 1.5 2 3-3.5" /></>}
      {kind === "shield" && <><path d="M12 3 4.5 6v6c0 4.4 3.2 7.8 7.5 9 4.3-1.2 7.5-4.6 7.5-9V6L12 3Z" /><path d="m8.8 12 2.3 2.3 4.2-4.6" /></>}
      {kind === "strength" && <><path d="M4 20h16" /><path d="M6 16v-4M10 16V8M14 16v-6M18 16V5" /></>}
      {kind === "support" && <><path d="M4 13v-1a8 8 0 0 1 16 0v1" /><rect x="3" y="13" width="4" height="6" rx="1.5" /><rect x="17" y="13" width="4" height="6" rx="1.5" /><path d="M19 19c0 1.5-1.8 2.5-5 2.5" /></>}
    </svg>
  );
}

export function WhyUs() {
  return (
    <section className={cn("shell", styles.section)} id="why-us" aria-labelledby="why-us-heading">
      <SectionHeading
        id="why-us-heading"
        eyebrow={`Why ${site.name}`}
        title={<>The most advanced and secure<br /><span className="accent-text">investment platform.</span></>}
        aside="One account, multiple investment and trading opportunities."
      />
      <ul className={styles.chips} aria-label="Included in one account">
        {accountOpportunities.map(item => <li key={item}>{item}</li>)}
      </ul>
      <div className={styles.grid}>
        {advantages.map((item, index) => (
          <article key={item.id} className={cn(styles.card, item.layout === "wide" && styles.wide, item.layout === "feature" && styles.feature)}>
            {"image" in item && <Image src={item.image} alt={item.alt} fill sizes="(max-width: 800px) 100vw, 66vw" />}
            <span className={styles.number}>0{index + 1}</span>
            <span className={styles.icon}><AdvantageIcon kind={item.icon} /></span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              {item.id === "regulated" && compliance.regulator && (
                <p className={styles.license}>Regulated by {compliance.regulator}{compliance.licenseNumber && ` · Licence ${compliance.licenseNumber}`}</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
