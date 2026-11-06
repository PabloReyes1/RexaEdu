import { cn, GradePill, SubmissionStatusBadge } from "@rexaedu/ui";
import { CalendarClock, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Activity, ClassInfo } from "@/demo/types";
import { dayDiff, formatDue, relativeDue } from "@/lib/dates";
import { ClassTag } from "./subject";

export const kindLabel: Record<Activity["kind"], string> = {
  tarea: "Tarea",
  examen: "Examen",
  proyecto: "Proyecto",
  laboratorio: "Laboratorio",
  lectura: "Lectura",
  oral: "Expresión oral",
};

/** Fila de una actividad en listas (inicio y tareas). */
export function TaskRow({
  activity: a,
  info,
  showGrade = false,
  passing = 60,
}: {
  activity: Activity;
  info: ClassInfo;
  showGrade?: boolean;
  passing?: number;
}) {
  const urgent = (a.status === "pendiente" || a.status === "devuelta") && dayDiff(a.dueAt) <= 1;
  return (
    <li>
      <Link
        href={`/alumno/tareas/${a.id}`}
        className="group flex items-center gap-3 rounded-md px-3 py-3 transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring"
      >
        <span
          aria-hidden
          className="h-10 w-1 shrink-0 rounded-full"
          style={{ backgroundColor: `var(--rx-subject-${info.color})` }}
        />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex flex-wrap items-center gap-x-2 text-xs">
            <ClassTag info={info} className="text-xs" />
            <span className="text-muted-foreground">· {kindLabel[a.kind]}</span>
          </span>
          <span className="line-clamp-2 font-semibold text-foreground">{a.title}</span>
          <span
            className={cn(
              "flex items-center gap-1 text-sm",
              urgent ? "font-semibold text-warning" : "text-muted-foreground",
            )}
          >
            <CalendarClock className="size-3.5 shrink-0" aria-hidden />
            {formatDue(a.dueAt)}
            {a.status === "pendiente" || a.status === "devuelta" ? (
              <span className="hidden sm:inline"> · {relativeDue(a.dueAt)}</span>
            ) : null}
          </span>
        </span>
        <span
          className={cn(
            "flex shrink-0 flex-col items-end gap-1",
            !showGrade && a.status === "pendiente" && "max-sm:hidden",
          )}
        >
          {showGrade && a.status === "calificada" && a.points !== undefined ? (
            <>
              <GradePill score={(a.points / a.maxPoints) * 100} passing={passing} decimals={0} />
              <span className="text-xs text-muted-foreground tabular-nums">
                {a.points}/{a.maxPoints} pts
              </span>
            </>
          ) : (
            <SubmissionStatusBadge status={a.status} />
          )}
        </span>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground"
          aria-hidden
        />
      </Link>
    </li>
  );
}
