import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./icon";
import styles from "./button.module.css";

type Variant = "primary" | "outline" | "ghost";
type Size = "md" | "sm";
type StyleProps = { variant?: Variant; size?: Size; block?: boolean; arrow?: IconName | false };

export function buttonClass({ variant = "primary", size = "md", block = false }: StyleProps = {}, className?: string) {
  return cn(styles.button, styles[variant], size === "sm" && styles.sm, block && styles.block, className);
}

function Arrow({ arrow }: { arrow: StyleProps["arrow"] }) {
  return arrow ? <span aria-hidden="true"><Icon name={arrow} /></span> : null;
}

export function Button({ variant, size, block, arrow = false, className, children, type = "button", ...props }: StyleProps & ComponentProps<"button">) {
  return (
    <button type={type} className={buttonClass({ variant, size, block }, className)} {...props}>
      {children}
      <Arrow arrow={arrow} />
    </button>
  );
}

export function ButtonLink({ variant, size, block, arrow = "arrow-up-right", className, children, ...props }: StyleProps & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClass({ variant, size, block }, className)} {...props}>
      {children}
      <Arrow arrow={arrow} />
    </Link>
  );
}
