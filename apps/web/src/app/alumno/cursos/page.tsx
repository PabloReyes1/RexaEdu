import { Badge, GradePill } from "@rexaedu/ui";
import { CalendarClock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/student/blocks";
import { ClassIcon } from "@/components/student/subject";
import { classResults, overdueActivities, pendingActivities, SCHOOL } from "@/demo/queries";
import { formatDue } from "@/lib/dates";
import { getCurrentStudent } from "@/lib/demo-session";

export const metadata: Metadata = { title: "Mis cursos" };

export default async function StudentCoursesPage() {
  const s = await getCurrentStudent();
  const now = new Date();
  const pending = pendingActivities(s, now);
  const overdue = overdueActivities(s, now);

  return (
    <>
      <PageHeader
        title="Mis cursos"
        description={`${s.grade} ${s.section} · ${s.classes.length} cursos asignados`}
      />
      <ul className="grid grid-cols-1 gap-(--rx-gap) md:grid-cols-2 xl:grid-cols-3">
        {classResults(s).map((r) => {
          const next = pending.find((a) => a.classId === r.info.id);
          const late = overdue.filter((a) => a.classId === r.info.id).length;
          return (
            <li key={r.info.id}>
              <Link
                href={`/alumno/cursos/${r.info.id}`}
                className="flex h-full flex-col gap-3 rounded-lg border-(length:--rx-card-border) border-border bg-surface p-(--rx-card-padding) shadow-card transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-ring"
              >
                <span className="flex items-start gap-3">
                  <ClassIcon info={r.info} className="size-11 [&_svg]:size-5" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading font-bold">{r.info.name}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {r.info.teacher}
                    </span>
                  </span>
                  {r.current === null ? (
                    <Badge>Sin notas</Badge>
                  ) : (
                    <GradePill score={r.current} passing={SCHOOL.passing} />
                  )}
                </span>
                <span className="mt-auto flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <CalendarClock className="size-4 shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">
                    {next
                      ? `Próxima: ${next.title} · ${formatDue(next.dueAt)}`
                      : "Sin entregas próximas"}
                  </span>
                  {late ? <Badge tone="danger">{late} vencidas</Badge> : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
