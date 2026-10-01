import type { CSSProperties } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowDown01Icon,
  ArrowDown02Icon,
  ArrowDownRight01Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  ArrowUp02Icon,
  ArrowUpRight01Icon,
  Bitcoin01Icon,
  Cancel01Icon,
  ChartUpIcon,
  File01Icon,
  Globe02Icon,
  HourglassIcon,
  Menu01Icon,
  Notification01Icon,
  PauseIcon,
  PlayIcon,
  StarIcon,
  Tick02Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";

// Inline SVG icons (Hugeicons). Used instead of Unicode glyphs like ↗ ✓ ★, which iOS renders as emoji.
const icons = {
  "arrow-left": ArrowLeft02Icon,
  "arrow-right": ArrowRight02Icon,
  "arrow-up": ArrowUp02Icon,
  "arrow-down": ArrowDown02Icon,
  "arrow-up-right": ArrowUpRight01Icon,
  "arrow-down-right": ArrowDownRight01Icon,
  "chevron-down": ArrowDown01Icon,
  alert: Alert02Icon,
  bell: Notification01Icon,
  check: Tick02Icon,
  close: Cancel01Icon,
  crypto: Bitcoin01Icon,
  file: File01Icon,
  globe: Globe02Icon,
  hourglass: HourglassIcon,
  menu: Menu01Icon,
  pause: PauseIcon,
  play: PlayIcon,
  star: StarIcon,
  "trend-up": ChartUpIcon,
  upload: Upload01Icon,
} as const;

export type IconName = keyof typeof icons;

const baseStyle: CSSProperties = { display: "inline-block", verticalAlign: "-0.125em", flexShrink: 0 };

export function Icon({ name, size = "1em", strokeWidth = 1.8, filled = false, className, style }: {
  name: IconName;
  size?: number | string;
  strokeWidth?: number;
  /** Fill the shape with the current colour (e.g. a solid star). */
  filled?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <HugeiconsIcon
      icon={icons[name]}
      size={size}
      strokeWidth={strokeWidth}
      fill={filled ? "currentColor" : "none"}
      className={className}
      style={{ ...baseStyle, ...style }}
      aria-hidden="true"
      focusable="false"
    />
  );
}
