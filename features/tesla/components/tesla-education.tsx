import { teslaBusinesses, tesla101 } from "../content";
import styles from "./tesla.module.css";
import { Icon as UiIcon } from "@/components/ui";

type BusinessIcon = (typeof teslaBusinesses)[number]["icon"];

function Icon({ kind }: { kind: BusinessIcon }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === "car" && <><path d="M4 15v-3l2.5-5h11L20 12v3a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 15Z" /><path d="M4 12h16" /><circle cx="8" cy="16.5" r="1.5" /><circle cx="16" cy="16.5" r="1.5" /></>}
      {kind === "battery" && <><rect x="6" y="5" width="12" height="16" rx="2" /><path d="M10 3h4M13 9l-3 4h4l-3 4" /></>}
      {kind === "charge" && <><path d="M7 20V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14M5 20h12" /><path d="M15 9h2a2 2 0 0 1 2 2v4a1 1 0 0 0 2 0V9l-2-2" /><path d="m11 8-2 3h3l-2 3" /></>}
      {kind === "chip" && <><rect x="7" y="7" width="10" height="10" rx="1.5" /><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" /></>}
    </svg>
  );
}

export function TeslaBusinesses() {
  return (
    <div className={styles.businesses}>
      {teslaBusinesses.map(item => (
        <article key={item.id} className={styles.business}>
          <span><Icon kind={item.icon} /></span>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}

export function Tesla101() {
  return (
    <div className={styles.learn}>
      <div>
        {tesla101.map(item => (
          <details key={item.question} className={styles.faq}>
            <summary>{item.question}<span aria-hidden="true">+</span></summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
      <aside className={styles.risk} aria-label="Risk warning">
        <b><UiIcon name="alert" /> Know the risks</b>
        <p>Investing in a single stock like TSLA is high risk. Prices can fall quickly and you may get back less than you invest. Past performance does not predict future returns.</p>
        <p>This platform provides information and tools, not personal investment advice. Consider your goals and whether you can afford losses before investing, and seek independent advice if you are unsure.</p>
      </aside>
    </div>
  );
}
