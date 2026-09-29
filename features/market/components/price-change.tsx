import { percent } from "@/lib/format";
import { cn } from "@/lib/utils";

export function PriceChange({ value, arrow = false, className }: { value: number; arrow?: boolean; className?: string }) {
  const up = value >= 0;
  return (
    <span className={cn(up ? "positive" : "negative", className)}>
      {arrow && (up ? "↗ " : "↘ ")}
      {percent(value)}
    </span>
  );
}
