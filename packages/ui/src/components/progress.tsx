import type { Tone } from "../academic";
import { cn } from "../cn";

const fill: Record<Tone, string> = {
  neutral: "bg-muted-foreground",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

export interface ProgressProps {
  value: number;
  max?: number;
  tone?: Tone;
  /** Texto accesible que describe la barra. */
  label: string;
  className?: string;
}

export function Progress({ value, max = 100, tone = "primary", label, className }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-muted", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width]", fill[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
