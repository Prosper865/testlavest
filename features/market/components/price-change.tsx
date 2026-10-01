import { percent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui";

export function PriceChange({ value, arrow = false, className }: { value: number; arrow?: boolean; className?: string }) {
  const up = value >= 0;
  return (
    <span className={cn(up ? "positive" : "negative", className)}>
      {arrow && <><Icon name={up ? "arrow-up-right" : "arrow-down-right"} />{" "}</>}
      {percent(value)}
    </span>
  );
}
