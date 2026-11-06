import { Badge, Card, CardContent, CardHeader, cn } from "@rexaedu/ui";
import { CalendarClock, Coffee } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/student/blocks";
import { ClassTag } from "@/components/student/subject";
import { classById, classesOn, nextSchoolDay, pendingActivities, weekStart } from "@/demo/queries";
import { capitalize, dayDiff, formatLongDay, formatTime } from "@/lib/dates";
import { getCurrentStudent } from "@/lib/demo-session";

export const metadata: Metadata = { title: "Horario" };

export default async function SchedulePage() {
  const s = await getCurrentStudent();
  const now = new Date();
  const monday = weekStart(now);
  const today = nextSchoolDay(now);
  const pending = pendingActivities(s, now);

  const days = [1, 2, 3, 4, 5].map((weekday) => {
    const date = new Date(monday.getTime() + (weekday - 1) * 86_400_000 + 12 * 3_600_000);
    const offset = dayDiff(date, now);
    return {
      weekday,
      date,
      isToday: today.offset === 0 && today.weekday === weekday,
      blocks: classesOn(s, weekday),
      due: pending.filter((a) => dayDiff(a.dueAt, now) === offset),
    };
  });

  return (
    <>
      <PageHeader
        title="Horario"
        description={`Semana del ${formatLongDay(days[0]!.date)} · ${s.grade} ${s.section}`}
      />
      <div className="grid grid-cols-1 gap-(--rx-gap) md:grid-cols-2 xl:grid-cols-5">
        {days.map((d) => (
          <Card
            key={d.weekday}
            className={cn(d.isToday && "border-primary ring-2 ring-primary/30")}
            aria-current={d.isToday ? "date" : undefined}
          >
            <CardHeader className="flex-row items-center justify-between gap-2">
              <h2 className="font-heading text-lg font-bold">
                {capitalize(formatLongDay(d.date))}
              </h2>
              {d.isToday ? <Badge tone="primary">Hoy</Badge> : null}
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {d.due.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {d.due.map((a) => (
                    <li key={a.id}>
                      <Link
                        href={`/alumno/tareas/${a.id}`}
                        className="flex items-start gap-2 rounded-md bg-warning-soft px-2.5 py-2 text-sm text-warning hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        <CalendarClock className="mt-0.5 size-4 shrink-0" aria-hidden />
                        <span>
                          <span className="font-semibold">Entrega {formatTime(a.dueAt)}:</span>{" "}
                          {a.title}
                          <span className="block text-xs">{classById(s, a.classId)?.name}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
              <ol className="flex flex-col gap-1">
                {d.blocks.map((b, i) => {
                  const prev = d.blocks[i - 1];
                  const breakBefore = prev && prev.end !== b.start;
                  return (
                    <li key={`${b.start}-${b.classId}`} className="flex flex-col gap-1">
                      {breakBefore ? (
                        <span className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
                          <Coffee className="size-3.5" aria-hidden />
                          Recreo {prev.end}–{b.start}
                        </span>
                      ) : null}
                      <Link
                        href={`/alumno/cursos/${b.classId}`}
                        className="block rounded-md border-l-4 bg-surface-muted px-2.5 py-1.5 transition-colors hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-ring"
                        style={{ borderLeftColor: `var(--rx-subject-${b.info.color})` }}
                      >
                        <span className="block text-xs text-muted-foreground tabular-nums">
                          {b.start}–{b.end}
                        </span>
                        <ClassTag info={b.info} className="text-sm" />
                        <span className="block text-xs text-muted-foreground">{b.room}</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
