import Image from "next/image";
import Link from "next/link";
import { ButtonLink, Eyebrow, SectionHeading } from "@/components/ui";
import { StrategyCard, StrategyDetails, StrategyGrid } from "@/features/investments/components/strategy-card";
import { strategies } from "@/features/investments/strategies";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import { faqs, principles } from "../content";
import styles from "./sections.module.css";

export function StrategiesSection() {
  return (
    <section className={cn("shell", styles.section)} id="investments" aria-labelledby="strategies-heading">
      <SectionHeading
        id="strategies-heading"
        eyebrow="Many paths. Your direction."
        title="Your ambition. Your strategy."
        aside={<>From your first stock to your next chapter.<br />Automate an approach that fits your ambitions.</>}
      />
      <StrategyGrid>
        {strategies.map((strategy, index) => (
          <StrategyCard key={strategy.id} strategy={strategy} index={index}>
            <StrategyDetails strategy={strategy}>
              <Link href="/investments" className="accent-text">Automate this strategy →</Link>
            </StrategyDetails>
          </StrategyCard>
        ))}
      </StrategyGrid>
    </section>
  );
}

export function ProfessionalSection() {
  return (
    <section className={cn("shell", styles.professional)}>
      <div className={styles.photo}>
        <Image src="/images/professionals.jpg" alt="Professionals collaborating around a table in a modern office" fill sizes="(max-width: 800px) 100vw, 50vw" />
        <div className={styles.caption}><span>THE HUMAN PERSPECTIVE</span><b>Ambition is personal.<br />Your approach should be too.</b></div>
      </div>
      <div className={styles.professionalCopy}>
        <Eyebrow>Perspective behind every decision</Eyebrow>
        <h2>Technology moves fast.<br /><span className="accent-text">Purpose moves you forward.</span></h2>
        <p>Markets are more than numbers on a screen. They’re the companies, people, and ideas shaping the way we live.</p>
        <p>{site.name} brings those possibilities into one considered experience. Explore different assets, understand your choices, and build confidence with a portfolio you can practice managing.</p>
        <div className={styles.features}>
          <span>01 <b>A global outlook</b></span>
          <span>02 <b>A clearer market view</b></span>
          <span>03 <b>Your ambitions, in focus</b></span>
        </div>
        <ButtonLink href="/dashboard">Step inside the platform</ButtonLink>
      </div>
    </section>
  );
}

export function ApproachSection() {
  return (
    <section className={styles.approach} id="approach">
      <div className={cn("shell", styles.approachGrid)}>
        <div>
          <Eyebrow>The {site.wordmark} approach</Eyebrow>
          <h2>Big ambitions.<br /><em>Thoughtful decisions.</em></h2>
          <p>Investing should give you perspective. We’re creating a place to explore opportunities, understand your choices, and keep your goals in sight.</p>
          <ButtonLink href="/dashboard" className={styles.approachButton}>Get to know your portfolio</ButtonLink>
        </div>
        <div className={styles.principles}>
          {principles.map(([number, title, text]) => (
            <div key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section className={cn("shell", styles.section, styles.learn)} id="learn" aria-labelledby="learn-heading">
      <SectionHeading id="learn-heading" eyebrow="A little knowledge goes a long way" title="Start with understanding." />
      {faqs.map(([question, answer]) => (
        <details className={styles.faq} key={question}>
          <summary>{question}<span aria-hidden="true">+</span></summary>
          <p>{answer}</p>
        </details>
      ))}
    </section>
  );
}

export function CtaSection() {
  return (
    <section className={cn("shell", styles.cta)}>
      <div>
        <Eyebrow>Your next chapter starts with a clearer view</Eyebrow>
        <h2>Make space for possibility.</h2>
      </div>
      <ButtonLink href="/dashboard">Explore the demo</ButtonLink>
    </section>
  );
}
