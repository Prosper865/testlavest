import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import { Brand } from "./brand";
import styles from "./footer.module.css";
import { Icon } from "@/components/ui";

export function SiteFooter() {
  return (
    <footer className={cn("shell", styles.footer)}>
      <div className={styles.top}>
        <Brand />
        <span>{site.tagline}</span>
        <a href="#main">Back to top <Icon name="arrow-up" /></a>
      </div>
      <p className={styles.disclaimer}>{site.disclaimer}</p>
      <div className={styles.bottom}>
        <span>© 2026 {site.name} · Concept platform</span>
        <span>Designed for a world of possibilities.</span>
      </div>
    </footer>
  );
}
