import { average } from "@rexaedu/grading";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  GradePill,
  Progress,
} from "@rexaedu/ui";
import { CalendarClock, ChevronRight, Coffee, UsersRound } from "lucide-react";
import Link from "next/link";
import { ClassIcon } from "@/components/student/subject";
import { nextSchoolDay, SCHOOL } from "@/demo/queries";
import type { Teacher } from "@/demo/teachers";
import {
  classLabel,
  sectionOf,
  studentResult,
  type ActivityStats,
  type TeachingClass,
  type World,
} from "@/demo/world";
import { at, formatDue, formatLongDay, SCHOOL_TZ } from "@/lib/dates";

export function classAverage(w: World, cls: TeachingClass): number | null {
  return average(sectionOf(w, cls).roster.map((s) => studentResult(w, cls, s.id).current));
}

/** Tarjeta de clase para "Mis clases". */
export function ClassCard({
  w,
  cls,
  title,
  subtitle,
}: {
  w: World;
  cls: TeachingClass;
  title: string;
  subtitle: string;
}) {
  const avg = classAverage(w, cls);
  const next = cls.activities
    .filter((a) => a.dueAt >= w.now)
    .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())[0];
  return (
    <Link
      href={`/profesor/clases/${cls.id}`}
      className="group flex h-full flex-col gap-3 rounded-lg border-(length:--rx-card-border) border-border bg-surface p-(--rx-card-padding) shadow-card transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-ring"
    >
      <div className="flex items-start gap-3">
        <ClassIcon info={cls.subject} className="size-11 [&_svg]:size-5" />
        <div className="min-w-0 flex-1">
          <p className="font-heading font-bold">{title}</p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <UsersRound className="size-3.5" aria-hidden />
            {subtitle}
          </p>
        </div>
        {avg === null ? (
          <Badge>Sin notas</Badge>
        ) : (
          <GradePill score={avg} passing={SCHOOL.passing} />
        )}
      </div>
      <p className="mt-auto flex items-center gap-1.5 text-sm text-muted-foreground">
        <CalendarClock className="size-4 shrink-0" aria-hidden />
        {next ? (
          <span className="truncate">
            Próxima: {next.title} · {formatDue(next.dueAt)}
          </span>
        ) : (
          "Sin entregas próximas"
        )}
      </p>
    </Link>
  );
}

/** Fila de actividad con avance de entregas y calificación. */
export function ActivityProgressRow({
  w,
  cls,
  activityId,
  title,
  meta,
  stats,
  href,
  action,
}: {
  w: World;
  cls: TeachingClass;
  activityId: string;
  title: string;
  meta: string;
  stats: ActivityStats;
  href: string;
  action?: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md px-3 py-3 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ring"
        data-activity={activityId}
      >
        <span
          aria-hidden
          className="h-10 w-1 shrink-0 rounded-full"
          style={{ backgroundColor: `var(--rx-subject-${cls.subject.color})` }}
        />
        <div className="flex min-w-0 flex-1 basis-48 flex-col">
          <span className="line-clamp-2 font-semibold">{title}</span>
          <span className="text-sm text-muted-foreground">{meta}</span>
        </div>
        <div className="flex w-full flex-col gap-1 pl-5 sm:w-48 sm:pl-0">
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>
              {stats.graded}/{stats.total} calificadas
            </span>
            {stats.toGrade > 0 ? (
              <span className="font-semibold text-primary">{stats.toGrade} por calificar</span>
            ) : null}
          </div>
          <Progress
            value={stats.graded}
            max={stats.total}
            tone={stats.graded === stats.total ? "success" : "primary"}
            label={`Avance de calificación de ${title} en ${classLabel(w, cls)}`}
          />
        </div>
        {action ? (
          <span className="hidden rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground group-hover:bg-primary/90 sm:inline">
            {action}
          </span>
        ) : (
          <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
        )}
      </Link>
    </li>
  );
}

const toMinutes = (t: string) => {
  const [h = 0, m = 0] = t.split(":").map(Number);
  return h * 60 + m;
};

/** Agenda del día del profesor (o del próximo día hábil). */
export function TeacherAgenda({ w, t }: { w: World; t: Teacher }) {
  const { weekday, offset } = nextSchoolDay(w.now);
  const blocks = t.schedule[weekday] ?? [];
  const nowMin =
    offset === 0
      ? toMinutes(
          new Intl.DateTimeFormat("en-GB", {
            timeZone: SCHOOL_TZ,
            hour: "2-digit",
            minute: "2-digit",
          }).format(w.now),
        )
      : -1;
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {offset === 0
            ? "Agenda de hoy"
            : `Agenda del ${formatLongDay(at(offset, "08:00", w.now))}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col">
          {blocks.map((b, i) => {
            const cls = b.classId ? w.classes.find((c) => c.id === b.classId) : undefined;
            const current = nowMin >= toMinutes(b.start) && nowMin < toMinutes(b.end);
            const prev = blocks[i - 1];
            return (
              <li key={`${b.start}-${i}`}>
                {prev && prev.end !== b.start ? (
                  <p className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                    <Coffee className="size-3.5" aria-hidden />
                    Recreo
                  </p>
                ) : null}
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2 py-2",
                    current && "bg-primary-soft",
                    nowMin >= toMinutes(b.end) && "opacity-60",
                  )}
                >
                  <span className="w-12 shrink-0 text-sm text-muted-foreground tabular-nums">
                    {b.start}
                  </span>
                  {cls ? (
                    <Link
                      href={`/profesor/clases/${cls.id}`}
                      className="flex min-w-0 flex-1 flex-col rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      {/* Especialista: lo que cambia es la sección; titular: la materia. */}
                      <span
                        className="text-sm font-semibold"
                        style={
                          t.model === "titular"
                            ? { color: `var(--rx-subject-${cls.subject.color})` }
                            : undefined
                        }
                      >
                        {t.model === "titular" ? cls.subject.name : classLabel(w, cls)}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {t.model === "titular" ? classLabel(w, cls) : cls.subject.name}
                      </span>
                    </Link>
                  ) : (
                    <span className="flex-1 text-sm text-muted-foreground italic">{b.note}</span>
                  )}
                  {current ? <Badge tone="primary">Ahora</Badge> : null}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
