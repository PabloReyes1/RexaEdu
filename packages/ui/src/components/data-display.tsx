import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { subjectColorIndex } from "../academic";
import { cn } from "../cn";
import { Card } from "./card";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

/** Indicador numérico para tableros. */
export function StatCard({ label, value, hint, icon: Icon, className }: StatCardProps) {
  return (
    <Card className={cn("flex items-start gap-3 p-(--rx-card-padding)", className)}>
      {Icon ? (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-soft-foreground">
          <Icon className="size-5" aria-hidden />
        </div>
      ) : null}
      <div className="flex min-w-0 flex-col">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-heading text-2xl font-bold text-foreground tabular-nums">{value}</p>
        {hint ? <div className="text-sm text-muted-foreground">{hint}</div> : null}
      </div>
    </Card>
  );
}

function subjectVar(name: string, colorIndex?: number) {
  return `var(--rx-subject-${colorIndex ?? subjectColorIndex(name)})`;
}

export interface SubjectTagProps {
  name: string;
  /** 1–8. Si no se indica, se calcula a partir del nombre. */
  colorIndex?: number;
  icon?: LucideIcon;
  className?: string;
}

/** Nombre de materia con su color identificador. */
export function SubjectTag({ name, colorIndex, icon: Icon, className }: SubjectTagProps) {
  const color = subjectVar(name, colorIndex);
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", className)}
      style={{ color }}
    >
      {Icon ? (
        <Icon className="size-4" aria-hidden />
      ) : (
        <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      )}
      {name}
    </span>
  );
}

/** Icono grande de materia (pensado para el modo primaria). */
export function SubjectIcon({
  name,
  colorIndex,
  icon: Icon,
  className,
}: SubjectTagProps & { icon: LucideIcon }) {
  const style = { "--subject": subjectVar(name, colorIndex) } as CSSProperties;
  return (
    <div
      style={style}
      className={cn(
        "flex size-12 items-center justify-center rounded-lg bg-(--subject)/12 text-(--subject)",
        className,
      )}
    >
      <Icon className="size-6" aria-label={name} />
    </div>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary-soft-foreground",
        className,
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}
